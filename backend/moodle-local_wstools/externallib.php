<?php
defined('MOODLE_INTERNAL') || die();

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_multiple_structure;
use core_external\external_single_structure;
use core_external\external_value;

require_once($CFG->libdir . '/filelib.php');
require_once($CFG->dirroot . '/course/lib.php');

class local_wstools_external extends external_api {
    public static function get_current_user_role_parameters() {
        return new external_function_parameters([]);
    }

    public static function get_current_user_role() {
        global $DB, $USER;

        self::validate_parameters(self::get_current_user_role_parameters(), []);
        self::validate_context(context_system::instance());

        if (is_siteadmin($USER)) {
            return [
                'role' => 'Admin',
                'label' => 'ผู้ดูแลระบบ',
            ];
        }

        $roles = $DB->get_fieldset_sql(
            'SELECT DISTINCT r.shortname
               FROM {role_assignments} ra
               JOIN {role} r ON r.id = ra.roleid
              WHERE ra.userid = ?',
            [$USER->id]
        );
        $roles = array_map('strtolower', $roles);

        if (array_intersect($roles, ['editingteacher', 'teacher'])) {
            return [
                'role' => 'Instructor',
                'label' => 'ผู้สอน',
            ];
        }

        if (array_intersect($roles, ['manager', 'coursecreator'])) {
            return [
                'role' => 'Admin',
                'label' => 'ผู้ดูแลระบบ',
            ];
        }

        return [
            'role' => 'Student',
            'label' => 'ผู้เรียน',
        ];
    }

    public static function get_current_user_role_returns() {
        return new external_single_structure([
            'role' => new external_value(PARAM_TEXT, 'Normalized role name'),
            'label' => new external_value(PARAM_TEXT, 'Thai display label'),
        ]);
    }

    public static function get_teaching_courses_parameters() {
        return new external_function_parameters([]);
    }

    public static function get_teaching_courses() {
        global $DB, $USER;

        self::validate_parameters(self::get_teaching_courses_parameters(), []);
        self::validate_context(context_system::instance());

        $teacherroles = ['editingteacher', 'teacher'];
        [$roleinsql, $roleparams] = $DB->get_in_or_equal($teacherroles, SQL_PARAMS_QM);

        $rows = $DB->get_records_sql(
            "SELECT c.id,
                    c.fullname,
                    c.shortname,
                    c.visible,
                    c.startdate,
                    c.enddate,
                    COUNT(DISTINCT ue.userid) AS enrolledcount
               FROM {course} c
               JOIN {context} ctx
                 ON ctx.instanceid = c.id
                AND ctx.contextlevel = ?
               JOIN {role_assignments} ra
                 ON ra.contextid = ctx.id
                AND ra.userid = ?
               JOIN {role} r
                 ON r.id = ra.roleid
              LEFT JOIN {enrol} e
                 ON e.courseid = c.id
                AND e.status = 0
              LEFT JOIN {user_enrolments} ue
                 ON ue.enrolid = e.id
                AND ue.status = 0
              WHERE c.id <> ?
                AND r.shortname $roleinsql
              GROUP BY c.id, c.fullname, c.shortname, c.visible, c.startdate, c.enddate
              ORDER BY c.sortorder ASC, c.fullname ASC",
            array_merge([CONTEXT_COURSE, $USER->id, SITEID], $roleparams)
        );

        $courses = [];
        foreach ($rows as $row) {
            $context = context_course::instance((int)$row->id);
            if (!has_capability('moodle/course:update', $context)) {
                continue;
            }

            $courses[] = [
                'id' => (int)$row->id,
                'fullname' => format_string($row->fullname, true, ['context' => $context]),
                'shortname' => format_string($row->shortname, true, ['context' => $context]),
                'visible' => (bool)$row->visible,
                'startdate' => (int)$row->startdate,
                'enddate' => (int)$row->enddate,
                'enrolledcount' => (int)$row->enrolledcount,
                'viewurl' => (new moodle_url('/course/view.php', ['id' => $row->id]))->out(false),
                'editurl' => (new moodle_url('/course/edit.php', ['id' => $row->id]))->out(false),
                'participantsurl' => (new moodle_url('/user/index.php', ['id' => $row->id]))->out(false),
            ];
        }

        return $courses;
    }

    public static function get_teaching_courses_returns() {
        return new external_multiple_structure(
            new external_single_structure([
                'id' => new external_value(PARAM_INT, 'Moodle course id'),
                'fullname' => new external_value(PARAM_TEXT, 'Course full name'),
                'shortname' => new external_value(PARAM_TEXT, 'Course short name'),
                'visible' => new external_value(PARAM_BOOL, 'Whether the course is visible'),
                'startdate' => new external_value(PARAM_INT, 'Course start date timestamp'),
                'enddate' => new external_value(PARAM_INT, 'Course end date timestamp'),
                'enrolledcount' => new external_value(PARAM_INT, 'Active enrolment count'),
                'viewurl' => new external_value(PARAM_URL, 'Course view URL'),
                'editurl' => new external_value(PARAM_URL, 'Course settings URL'),
                'participantsurl' => new external_value(PARAM_URL, 'Course participants URL'),
            ])
        );
    }

    public static function get_forum_module_parameters() {
        return new external_function_parameters([
            'coursemoduleid' => new external_value(PARAM_INT, 'Course module id'),
        ]);
    }

    public static function get_forum_module($coursemoduleid) {
        global $DB;

        $params = self::validate_parameters(self::get_forum_module_parameters(), [
            'coursemoduleid' => $coursemoduleid,
        ]);

        self::validate_context(context_system::instance());
        $cm = get_coursemodule_from_id('forum', $params['coursemoduleid'], 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);

        $forum = $DB->get_record('forum', ['id' => $cm->instance], '*', MUST_EXIST);

        return [
            'id' => (int)$forum->id,
            'coursemodule' => (int)$cm->id,
            'course' => (int)$forum->course,
            'name' => format_string($forum->name, true, ['context' => $context]),
            'type' => (string)$forum->type,
            'intro' => (string)$forum->intro,
            'introformat' => (int)$forum->introformat,
        ];
    }

    public static function get_forum_module_returns() {
        return new external_single_structure([
            'id' => new external_value(PARAM_INT, 'Forum id'),
            'coursemodule' => new external_value(PARAM_INT, 'Course module id'),
            'course' => new external_value(PARAM_INT, 'Moodle course id'),
            'name' => new external_value(PARAM_TEXT, 'Forum name'),
            'type' => new external_value(PARAM_TEXT, 'Forum type'),
            'intro' => new external_value(PARAM_RAW, 'Forum intro HTML'),
            'introformat' => new external_value(PARAM_INT, 'Forum intro format'),
        ]);
    }

    public static function update_course_image_parameters() {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'Moodle course id'),
            'imageurl' => new external_value(PARAM_URL, 'Public or internal URL Moodle can download'),
            'filename' => new external_value(PARAM_FILE, 'Optional target filename', VALUE_DEFAULT, ''),
        ]);
    }

    public static function update_course_image($courseid, $imageurl, $filename = '') {
        global $DB;

        $params = self::validate_parameters(self::update_course_image_parameters(), [
            'courseid' => $courseid,
            'imageurl' => $imageurl,
            'filename' => $filename,
        ]);

        $course = $DB->get_record('course', ['id' => $params['courseid']], '*', MUST_EXIST);
        $context = context_course::instance($course->id);
        self::validate_context($context);
        require_capability('moodle/course:update', $context);

        $curl = new curl();
        $content = $curl->get($params['imageurl'], [], [
            'CURLOPT_FOLLOWLOCATION' => true,
            'CURLOPT_MAXREDIRS' => 3,
        ]);
        $info = $curl->get_info();

        if ($content === false || empty($content) || (int)($info['http_code'] ?? 0) >= 400) {
            throw new moodle_exception('cannotdownloadimage', 'local_wstools');
        }

        $imageinfo = @getimagesizefromstring($content);
        if ($imageinfo === false || empty($imageinfo['mime'])) {
            throw new moodle_exception('invalidimage', 'local_wstools');
        }

        $extensionbymime = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
        ];
        if (!isset($extensionbymime[$imageinfo['mime']])) {
            throw new moodle_exception('unsupportedimage', 'local_wstools');
        }

        $extension = $extensionbymime[$imageinfo['mime']];
        $filename = trim($params['filename']);
        if ($filename === '') {
            $filename = 'course-' . $course->id . '.' . $extension;
        }
        $filename = clean_param($filename, PARAM_FILE);
        if (!preg_match('/\.(jpe?g|png|webp|gif)$/i', $filename)) {
            $filename .= '.' . $extension;
        }

        $fs = get_file_storage();
        $fs->delete_area_files($context->id, 'course', 'overviewfiles', 0);

        $filerecord = [
            'contextid' => $context->id,
            'component' => 'course',
            'filearea' => 'overviewfiles',
            'itemid' => 0,
            'filepath' => '/',
            'filename' => $filename,
        ];

        $file = $fs->create_file_from_string($filerecord, $content);
        rebuild_course_cache($course->id, true);

        return [
            'success' => true,
            'filename' => $file->get_filename(),
        ];
    }

    public static function update_course_image_returns() {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Whether the image was updated'),
            'filename' => new external_value(PARAM_FILE, 'Stored Moodle filename'),
        ]);
    }

    public static function update_sections_parameters() {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'Moodle course id'),
            'sections' => new external_multiple_structure(
                new external_single_structure([
                    'num'     => new external_value(PARAM_INT, 'Section number (1-based)'),
                    'name'    => new external_value(PARAM_TEXT, 'Section name'),
                    'summary' => new external_value(PARAM_RAW, 'Section summary HTML', VALUE_DEFAULT, ''),
                ])
            ),
        ]);
    }

    public static function update_sections($courseid, $sections) {
        global $DB;

        $params = self::validate_parameters(self::update_sections_parameters(), [
            'courseid' => $courseid,
            'sections' => $sections,
        ]);

        $course = $DB->get_record('course', ['id' => $params['courseid']], '*', MUST_EXIST);
        $context = context_course::instance($course->id);
        self::validate_context($context);
        require_capability('moodle/course:update', $context);

        // Determine max section number needed
        $maxnum = 0;
        foreach ($params['sections'] as $s) {
            if ($s['num'] > $maxnum) $maxnum = $s['num'];
        }
        // Ensure all required sections exist in mdl_course_sections
        course_create_sections_if_missing($params['courseid'], range(0, $maxnum));

        $updated = 0;
        foreach ($params['sections'] as $s) {
            $section = $DB->get_record('course_sections', [
                'course'  => $params['courseid'],
                'section' => $s['num'],
            ]);
            if ($section) {
                $record = (object)['id' => $section->id, 'name' => $s['name']];
                if ($s['summary'] !== '') {
                    $record->summary = $s['summary'];
                    $record->summaryformat = FORMAT_HTML;
                }
                $DB->update_record('course_sections', $record);
                $updated++;
            }
        }

        rebuild_course_cache($params['courseid'], true);

        return ['updated' => $updated];
    }

    public static function update_sections_returns() {
        return new external_single_structure([
            'updated' => new external_value(PARAM_INT, 'Number of sections updated'),
        ]);
    }

    public static function trim_sections_parameters() {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'Moodle course id'),
            'keepnum'  => new external_value(PARAM_INT, 'Keep sections 0..keepnum, delete the rest'),
        ]);
    }

    public static function trim_sections($courseid, $keepnum) {
        global $DB;

        $params = self::validate_parameters(self::trim_sections_parameters(), [
            'courseid' => $courseid,
            'keepnum'  => $keepnum,
        ]);

        $course = $DB->get_record('course', ['id' => $params['courseid']], '*', MUST_EXIST);
        $context = context_course::instance($course->id);
        self::validate_context($context);
        require_capability('moodle/course:update', $context);

        $deleted = 0;
        $sections = $DB->get_records('course_sections', ['course' => $params['courseid']], 'section DESC');
        foreach ($sections as $section) {
            if ($section->section > $params['keepnum']) {
                course_delete_section($course, $section, true, true);
                $deleted++;
            }
        }

        if ($deleted > 0) {
            rebuild_course_cache($params['courseid'], true);
        }

        return ['deleted' => $deleted];
    }

    public static function trim_sections_returns() {
        return new external_single_structure([
            'deleted' => new external_value(PARAM_INT, 'Number of sections deleted'),
        ]);
    }

    public static function delete_empty_sections_parameters() {
        return new external_function_parameters([
            'courseid'     => new external_value(PARAM_INT, 'Moodle course id'),
            'section_nums' => new external_multiple_structure(
                new external_value(PARAM_INT, 'Section number to delete if empty')
            ),
        ]);
    }

    public static function delete_empty_sections($courseid, $section_nums) {
        global $DB;

        $params = self::validate_parameters(self::delete_empty_sections_parameters(), [
            'courseid'     => $courseid,
            'section_nums' => $section_nums,
        ]);

        $course = $DB->get_record('course', ['id' => $params['courseid']], '*', MUST_EXIST);
        $context = context_course::instance($course->id);
        self::validate_context($context);
        require_capability('moodle/course:update', $context);

        $deleted = 0;
        $skipped = 0;

        foreach ($params['section_nums'] as $num) {
            $section = $DB->get_record('course_sections', [
                'course'  => $params['courseid'],
                'section' => $num,
            ]);
            if (!$section) {
                continue;
            }
            // Skip sections that have modules (teacher-added content)
            if (!empty(trim((string)($section->sequence ?? '')))) {
                $skipped++;
                continue;
            }
            course_delete_section($course, $section, true, true);
            $deleted++;
        }

        if ($deleted > 0) {
            rebuild_course_cache($params['courseid'], true);
        }

        return ['deleted' => $deleted, 'skipped' => $skipped];
    }

    public static function delete_empty_sections_returns() {
        return new external_single_structure([
            'deleted' => new external_value(PARAM_INT, 'Sections deleted'),
            'skipped' => new external_value(PARAM_INT, 'Sections skipped — had teacher content'),
        ]);
    }
}
