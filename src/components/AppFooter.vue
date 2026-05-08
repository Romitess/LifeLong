<template>
  <footer class="app-footer text-white">
    <GoldenUnderline position="top" />
    <div class="footer-container q-py-md q-px-xl">
      <div class="row items-center justify-between">
        <!-- Left Section: Related Links -->
        <div class="col-12 col-md-5">
          <h3 class="footer-title text-weight-bold q-mb-sm">{{ t('footer.relatedLinks') }}</h3>
          <ul class="related-links">
            <li>
              <a href="https://lifelong.buu.ac.th/loginadmin" target="_blank">
                <q-icon name="circle" size="6px" class="q-mr-sm" />
                {{ t('footer.forInstructors') }}
              </a>
            </li>
            <li>
              <a href="https://www.buu.ac.th/bachelor-degree-old/" target="_blank">
                <q-icon name="circle" size="6px" class="q-mr-sm" />
                {{ t('footer.buuCourses') }}
              </a>
            </li>
            <!-- Keeping the social buttons here for accessibility and layout balance -->
            <li class="q-mt-md">
              <div class="row q-gutter-md items-center">
                <span class="text-caption text-grey-3" style="font-size: 1rem">{{
                  t('footer.followUs')
                }}</span>
                <q-btn
                  round
                  unelevated
                  color="blue-9"
                  icon="fab fa-facebook-f"
                  type="a"
                  href="https://www.facebook.com/BUU.lifelong/"
                  target="_blank"
                  class="social-btn"
                />
                <q-btn
                  round
                  unelevated
                  color="black"
                  icon="fab fa-tiktok"
                  type="a"
                  href="https://www.tiktok.com/@buu.lifelong"
                  target="_blank"
                  class="social-btn"
                />
                <q-btn
                  round
                  unelevated
                  color="pink-7"
                  icon="fab fa-instagram"
                  type="a"
                  href="https://www.instagram.com/buu.lifelong"
                  target="_blank"
                  class="social-btn"
                />
                <q-btn
                  round
                  unelevated
                  color="red-8"
                  icon="fab fa-youtube"
                  type="a"
                  href="https://www.youtube.com/@buulifelong"
                  target="_blank"
                  class="social-btn"
                />
                <q-btn
                  round
                  unelevated
                  color="green-6"
                  icon="fab fa-line"
                  type="a"
                  href="https://line.me/R/ti/p/@996rqoni?oat_content=url&ts=10081646"
                  target="_blank"
                  class="social-btn"
                />
              </div>
            </li>
          </ul>
        </div>

        <!-- Right Section: Logo & Copyright -->
        <div class="col-12 col-md-5 text-right flex column items-end">
          <div class="logo-container q-mb-sm">
            <img src="../assets/brand/buu-lll-logo.png" alt="BUU LLL Logo" class="footer-logo" />
          </div>
          <div class="copyright-info text-right">
            <div class="q-mb-xs">© 2026 Lifelong Learning Burapha University</div>
            <div class="crafted-by">
              {{ t('footer.craftedBy') }}
              <span class="text-orange-8">{{ t('footer.computerCenter') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import GoldenUnderline from 'src/components/common/GoldenUnderline.vue';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.app-footer {
  background-color: #7c7c7c; // Exact Brand Grey from Logo
  width: 100%;
  position: relative;
}

.footer-container {
  max-width: 1400px;
  padding-left: 32px;
  padding-right: 32px;
  margin: 0 auto;
}

.footer-logo {
  max-width: 180px;
  height: auto;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4)); // Glow to separate logo from grey bg
}

.footer-title {
  font-size: 1.1rem;
  color: #fff;
  letter-spacing: 0.5px;
  font-weight: 800;
}

.related-links {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 12px;

    a {
      color: #fff; // White text for links on grey
      text-decoration: none;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;

      &:hover {
        color: #f7d046; // Gold on hover
        transform: translateX(5px);
      }

      .q-icon {
        color: #f7d046;
        margin-right: 8px;
      }
    }
  }
}

.copyright-info {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.crafted-by {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);

  .text-orange-8 {
    color: #f7d046 !important;
    font-weight: 700;
  }
}

.social-btn {
  border: 1.5px solid white;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  font-size: 14px !important; /* slightly smaller icon */

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
  }
}

/* Responsive adjustments */
@media (max-width: 1023px) {
  .footer-container {
    padding-left: 24px;
    padding-right: 24px;
  }

  .text-right {
    text-align: left !important;
  }

  .items-end {
    align-items: flex-start !important;
  }

  .col-md-5 {
    margin-bottom: 40px;
  }
}
</style>
