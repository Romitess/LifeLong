import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MoodleService } from '../moodle.service';
import { MoodleUserTokenService } from '../moodle-user-token.service';
import { MoodleFileProxyService } from '../moodle-file-proxy.service';

export interface ForumInfo {
  id: number;
  coursemodule: number;
  name: string;
  type: string;
  intro: string | null;
}

export interface ForumDiscussionSummary {
  id: number;
  subject: string;
  authorName: string;
  authorPictureUrl: string | null;
  authorAvatarSeed: string | null;
  created: number;
  numReplies: number;
  pinned: boolean;
  locked: boolean;
  canReply: boolean;
}

export interface ForumPost {
  id: number;
  parentId: number | null;
  hasParent: boolean;
  subject: string;
  message: string | null;
  authorName: string;
  authorPictureUrl: string | null;
  authorAvatarSeed: string | null;
  created: number;
  canReply: boolean;
}

export interface ForumDiscussionThread {
  discussionId: number;
  subject: string;
  posts: ForumPost[];
}

interface RawForum {
  id: number;
  cmid: number;
  name?: string;
  type?: string;
  intro?: string;
}

interface RawDiscussion {
  discussion: number;
  userid?: number;
  subject?: string;
  name?: string;
  message?: string;
  created: number;
  userfullname?: string;
  userpictureurl?: string;
  numreplies?: number;
  pinned?: boolean;
  locked?: boolean;
  canreply?: boolean;
}

interface RawPostAuthor {
  id?: number;
  fullname?: string;
  urls?: { profileimage?: string };
}

interface RawPost {
  id: number;
  parentid?: number | null;
  hasparent?: boolean;
  subject?: string;
  message?: string;
  author?: RawPostAuthor;
  timecreated: number;
  capabilities?: { reply?: boolean };
}

interface LocalProfile {
  name: string | null;
  imageUrl: string | null;
  avatarSeed: string;
}

@Injectable()
export class MoodleForumService {
  constructor(
    private readonly moodleService: MoodleService,
    private readonly tokenService: MoodleUserTokenService,
    private readonly fileProxy: MoodleFileProxyService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ดึง per-user token ของนักเรียนจาก username
  private tokenFor(username: string): Promise<string> {
    return this.tokenService.getTokenForUsername(username);
  }

  // โหลดข้อมูล forum activity พร้อมรายการกระทู้ล่าสุด (สูงสุด 50 กระทู้)
  async getForum(
    username: string,
    moodleCourseId: number,
    moduleId: number,
  ): Promise<{ forum: ForumInfo; discussions: ForumDiscussionSummary[] }> {
    await this.moodleService.ensureStudentEnrolled(username, moodleCourseId);
    const token = await this.tokenFor(username);

    const forum = await this.findForum(token, moodleCourseId, moduleId);
    const discussions = await this.getDiscussions(token, forum.id);

    return {
      forum: {
        id: forum.id,
        coursemodule: forum.cmid,
        name: forum.name ?? '',
        type: forum.type ?? 'general',
        intro: forum.intro ? this.fileProxy.rewriteEmbeddedFileUrls(forum.intro) : null,
      },
      discussions,
    };
  }

  // โหลดทุก post ในกระทู้เรียงตามเวลาสร้าง (ASC)
  async getDiscussion(username: string, discussionId: number): Promise<ForumDiscussionThread> {
    const token = await this.tokenFor(username);
    const params = new URLSearchParams();
    params.append('discussionid', discussionId.toString());
    params.append('sortby', 'created');
    params.append('sortdirection', 'ASC');

    const result = (await this.moodleService.callMoodleApi(
      'mod_forum_get_discussion_posts',
      params,
      token,
    )) as { posts?: RawPost[] };

    const rawPosts = result?.posts ?? [];
    const profileByMoodleId = await this.getLocalProfilesByMoodleIds(
      rawPosts.map((post) => post.author?.id).filter(isNumber),
    );
    const posts = rawPosts.map((post) => this.mapPost(post, profileByMoodleId));
    const subject = posts.find((post) => !post.hasParent)?.subject ?? posts[0]?.subject ?? '';
    return { discussionId, subject, posts };
  }

  /** Reply to an existing post in a discussion (posts as the current user). */
  async replyToPost(
    username: string,
    parentPostId: number,
    message: string,
  ): Promise<{ postId: number }> {
    const text = message?.trim();
    if (!text) throw new BadRequestException('ข้อความตอบกลับว่างไม่ได้');
    const token = await this.tokenFor(username);

    const params = new URLSearchParams();
    params.append('postid', parentPostId.toString());
    params.append('subject', 'Re:');
    params.append('message', text);
    params.append('options[0][name]', 'discussionsubscribe');
    params.append('options[0][value]', '0');

    const result = (await this.moodleService.callMoodleApi(
      'mod_forum_add_discussion_post',
      params,
      token,
    )) as { postid?: number; warnings?: Array<{ message?: string }> };

    const warning = result?.warnings?.[0]?.message;
    if (warning) throw new BadRequestException(warning);
    if (!result?.postid) throw new BadRequestException('ส่งคำตอบไม่สำเร็จ');
    return { postId: result.postid };
  }

  /** Start a new discussion in a forum (posts as the current user). */
  async createDiscussion(
    username: string,
    moodleCourseId: number,
    moduleId: number,
    subject: string,
    message: string,
  ): Promise<{ discussionId: number }> {
    const subjectText = subject?.trim();
    const messageText = message?.trim();
    if (!subjectText) throw new BadRequestException('หัวข้อกระทู้ว่างไม่ได้');
    if (!messageText) throw new BadRequestException('เนื้อหากระทู้ว่างไม่ได้');

    await this.moodleService.ensureStudentEnrolled(username, moodleCourseId);
    const token = await this.tokenFor(username);
    const forum = await this.findForum(token, moodleCourseId, moduleId);

    const params = new URLSearchParams();
    params.append('forumid', forum.id.toString());
    params.append('subject', subjectText);
    params.append('message', messageText);

    const result = (await this.moodleService.callMoodleApi(
      'mod_forum_add_discussion',
      params,
      token,
    )) as { discussionid?: number; warnings?: Array<{ message?: string }> };

    const warning = result?.warnings?.[0]?.message;
    if (warning) throw new BadRequestException(warning);
    if (!result?.discussionid) throw new BadRequestException('สร้างกระทู้ไม่สำเร็จ');
    return { discussionId: result.discussionid };
  }

  // ค้นหา forum activity ในวิชาจาก cmid
  private async findForum(
    token: string,
    moodleCourseId: number,
    moduleId: number,
  ): Promise<RawForum> {
    const params = new URLSearchParams();
    params.append('courseids[0]', moodleCourseId.toString());
    const forums = (await this.moodleService.callMoodleApi(
      'mod_forum_get_forums_by_courses',
      params,
      token,
    )) as RawForum[];

    const forum = Array.isArray(forums) ? forums.find((item) => item.cmid === moduleId) : null;
    if (!forum) {
      throw new NotFoundException(`ไม่พบกระดานสนทนา (module ${moduleId}) ในวิชา ${moodleCourseId}`);
    }
    return forum;
  }

  // ดึงรายการกระทู้จาก forum (Moodle 5.2 ไม่รับ sortby param — เรียงตาม pinned + ล่าสุดก่อนโดย default)
  private async getDiscussions(token: string, forumId: number): Promise<ForumDiscussionSummary[]> {
    // Note: mod_forum_get_forum_discussions on Moodle 5.2 rejects sortby/sortdirection
    // params — it returns pinned-first then most-recent by default. Only page/perpage are valid.
    const params = new URLSearchParams();
    params.append('forumid', forumId.toString());
    params.append('page', '0');
    params.append('perpage', '50');

    const result = (await this.moodleService.callMoodleApi(
      'mod_forum_get_forum_discussions',
      params,
      token,
    )) as { discussions?: RawDiscussion[] };

    const discussions = result?.discussions ?? [];
    const profileByMoodleId = await this.getLocalProfilesByMoodleIds(
      discussions.map((discussion) => discussion.userid).filter(isNumber),
    );

    return discussions.map((discussion) => {
      const localProfile =
        discussion.userid != null ? profileByMoodleId.get(discussion.userid) : undefined;
      return {
        id: discussion.discussion,
        subject: discussion.subject ?? discussion.name ?? '',
        authorName: localProfile?.name || discussion.userfullname || '',
        authorPictureUrl: localProfile ? localProfile.imageUrl : discussion.userpictureurl || null,
        authorAvatarSeed: localProfile?.avatarSeed ?? null,
        created: discussion.created,
        numReplies: discussion.numreplies ?? 0,
        pinned: discussion.pinned === true,
        locked: discussion.locked === true,
        canReply: discussion.canreply === true,
      };
    });
  }

  // แปลง raw post จาก Moodle และเปลี่ยน embedded pluginfile URL เป็น signed proxy URL
  private mapPost(post: RawPost, profileByMoodleId: Map<number, LocalProfile>): ForumPost {
    const localProfile =
      post.author?.id != null ? profileByMoodleId.get(post.author.id) : undefined;
    return {
      id: post.id,
      parentId: post.parentid ?? null,
      hasParent: post.hasparent === true,
      subject: post.subject ?? '',
      message: post.message ? this.fileProxy.rewriteEmbeddedFileUrls(post.message) : null,
      authorName: localProfile?.name || post.author?.fullname || '',
      authorPictureUrl: localProfile
        ? localProfile.imageUrl
        : post.author?.urls?.profileimage || null,
      authorAvatarSeed: localProfile?.avatarSeed ?? null,
      created: post.timecreated,
      canReply: post.capabilities?.reply === true,
    };
  }

  private async getLocalProfilesByMoodleIds(
    moodleUserIds: number[],
  ): Promise<Map<number, LocalProfile>> {
    const uniqueIds = [...new Set(moodleUserIds.filter((id) => Number.isFinite(id) && id > 0))];
    if (uniqueIds.length === 0) return new Map();

    const rows = await this.dataSource.query<
      Array<{
        userId: number | string;
        lmsId: number | string;
        firstNameTh: string | null;
        lastNameTh: string | null;
        imageUrl: string | null;
      }>
    >(
      `SELECT
         USER_ID AS userId,
         LMS_ID AS lmsId,
         COALESCE(NULLIF(TRIM(USER_FNAMETH), ''), USER_FNAMEEN) AS firstNameTh,
         COALESCE(NULLIF(TRIM(USER_LNAMETH), ''), USER_LNAMEEN) AS lastNameTh,
         USER_IMAGE_URL AS imageUrl
       FROM LLTUMUSER
       WHERE LMS_ID IN (?)`,
      [uniqueIds],
    );

    return new Map(
      rows.map((row) => [
        Number(row.lmsId),
        {
          name: [row.firstNameTh, row.lastNameTh].filter(Boolean).join(' ') || null,
          imageUrl: row.imageUrl ?? null,
          avatarSeed: `lll-user-${row.userId}`,
        },
      ]),
    );
  }
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
