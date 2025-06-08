<template>
  <teleport to="body">
    <transition name="modal" appear>
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>You're already signed in!</h2>
            <button class="modal-close-btn" @click="closeModal">&times;</button>
          </div>

          <div class="modal-body">
            <div class="modal-form-group" style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(45deg, #ff6b6b, #feca57); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 2.5rem; color: white; font-weight: bold;">
                ✓
              </div>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 1rem; line-height: 1.6; margin: 0;">
                You already have an account and you're currently signed in. 
                Would you like to continue to your personalized recommendations?
              </p>
            </div>

            <button class="modal-submit-btn" @click="goToSearch">
              Continue to Search
            </button>
            
            <div class="modal-link-section">
              <a href="#" @click.prevent="closeModal">Stay on Home Page</a>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'AlreadyLoggedInModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'go-to-search'],
  methods: {
    closeModal() {
      this.$emit('close');
    },
    goToSearch() {
      this.$emit('go-to-search');
      this.closeModal();
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  }
}
</script>

<style src="@/styles/login-register.scss" scoped></style> 