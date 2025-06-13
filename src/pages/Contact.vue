<script>
import { ref, reactive } from 'vue';
import { useTheme } from '@/composables/useTheme';

export default {
  name: 'Contact',
  setup() {
    const { isDark } = useTheme();
    
    // Form data
    const form = reactive({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Form validation
    const errors = ref({});
    const isSubmitting = ref(false);
    const submitSuccess = ref(false);
    
    // Validation functions
    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };
    
    const validateForm = () => {
      const newErrors = {};
      
      if (!form.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(form.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!form.subject.trim()) {
        newErrors.subject = 'Subject is required';
      }
      
      if (!form.message.trim()) {
        newErrors.message = 'Message is required';
      } else if (form.message.trim().length < 10) {
        newErrors.message = 'Message must be at least 10 characters long';
      }
      
      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };
    
    // Submit form
    const submitForm = async () => {
      if (!validateForm()) {
        return;
      }
      
      isSubmitting.value = true;
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reset form
        Object.keys(form).forEach(key => form[key] = '');
        submitSuccess.value = true;
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          submitSuccess.value = false;
        }, 5000);
        
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        isSubmitting.value = false;
      }
    };
    
    return {
      isDark,
      form,
      errors,
      isSubmitting,
      submitSuccess,
      submitForm
    };
  }
};
</script>

<template>
  <div class="contact-page">
    <!-- Hero Section -->
    <section class="contact-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="contact-title">
            <span class="gradient-text">Contact Us</span>
          </h1>
          <p class="contact-subtitle">
            Have a question, suggestion, or issue? 
            We're here to help. Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Content -->
    <section class="contact-content">
      <div class="container">
        <div class="contact-grid">
          <!-- Contact Form -->
          <div class="contact-form-section">
            <div class="form-card">
              <h2 class="form-title">Send us a message</h2>
              
              <!-- Success Message -->
              <div v-if="submitSuccess" class="success-message">
                <span class="material-icons">check_circle</span>
                <p>Message sent successfully! We'll get back to you soon.</p>
              </div>
              
              <form @submit.prevent="submitForm" class="contact-form">
                <!-- Name Field -->
                <div class="form-group">
                  <label for="name" class="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    v-model="form.name"
                    class="form-input"
                    :class="{ 'error': errors.name }"
                    placeholder="Your full name"
                  />
                  <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
                </div>

                <!-- Email Field -->
                <div class="form-group">
                  <label for="email" class="form-label">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    v-model="form.email"
                    class="form-input"
                    :class="{ 'error': errors.email }"
                    placeholder="your@email.com"
                  />
                  <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
                </div>

                <!-- Subject Field -->
                <div class="form-group">
                  <label for="subject" class="form-label">Subject *</label>
                  <select
                    id="subject"
                    v-model="form.subject"
                    class="form-input"
                    :class="{ 'error': errors.subject }"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="bug">Report a Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="account">Account Issues</option>
                    <option value="content">Inappropriate Content</option>
                    <option value="other">Other</option>
                  </select>
                  <span v-if="errors.subject" class="error-text">{{ errors.subject }}</span>
                </div>

                <!-- Message Field -->
                <div class="form-group">
                  <label for="message" class="form-label">Message *</label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    class="form-textarea"
                    :class="{ 'error': errors.message }"
                    placeholder="Write your message here..."
                    rows="6"
                  ></textarea>
                  <span v-if="errors.message" class="error-text">{{ errors.message }}</span>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="submit-btn"
                  :disabled="isSubmitting"
                  :class="{ 'loading': isSubmitting }"
                >
                  <span v-if="!isSubmitting">
                    <span class="material-icons">send</span>
                    Send Message
                  </span>
                  <span v-else>
                    <span class="material-icons spinning">refresh</span>
                    Sending...
                  </span>
                </button>
              </form>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="contact-info-section">
            <div class="info-card">
              <h3 class="info-title">Contact Information</h3>
              
              <div class="info-item">
                <div class="info-icon">
                  <span class="material-icons">email</span>
                </div>
                <div class="info-content">
                  <h4>Email</h4>
                  <p>contact@filmsage.com</p>
                  <p>support@filmsage.com</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <span class="material-icons">schedule</span>
                </div>
                <div class="info-content">
                  <h4>Business Hours</h4>
                  <p>Monday to Friday: 9:00 AM - 6:00 PM</p>
                  <p>Weekends: 10:00 AM - 4:00 PM</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <span class="material-icons">support_agent</span>
                </div>
                <div class="info-content">
                  <h4>Technical Support</h4>
                  <p>Available 24/7 for critical issues</p>
                  <p>Response time: 2-4 hours</p>
                </div>
              </div>
            </div>

            <!-- FAQ Section -->
            <div class="faq-card">
              <h3 class="info-title">Frequently Asked Questions</h3>
              
              <div class="faq-item">
                <h4>How can I recover my password?</h4>
                <p>Use the "Forgot Password" option on the login page.</p>
              </div>

              <div class="faq-item">
                <h4>Can I change my username?</h4>
                <p>Yes, you can change it from your user profile settings.</p>
              </div>

              <div class="faq-item">
                <h4>How do I report inappropriate content?</h4>
                <p>Use this contact form or the report button on each review.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/contact';

.contact-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// Hero Section
.contact-hero {
  padding: 80px 0 60px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.contact-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 30px;
  
  .gradient-text {
    background: linear-gradient(45deg, #ffffff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.contact-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
}

// Contact Content
.contact-content {
  padding: 0 0 80px;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 60px;
  align-items: start;
}

// Form Section
.form-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-title {
  font-size: 2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 30px;
  text-align: center;
}

.success-message {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.4);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.95);
  
  i {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #4caf50;
  }
  
  p {
    margin: 0;
    font-weight: 500;
  }
}

.contact-form {
  .form-group {
    margin-bottom: 25px;
  }
  
  .form-label {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    margin-bottom: 8px;
    font-size: 0.95rem;
  }
  
  .form-input, .form-textarea {
    width: 100%;
    padding: 15px 20px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
    font-size: 1rem;
    transition: all 0.3s ease;
    box-sizing: border-box;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    &:focus {
      outline: none;
      border-color: #ff6b6b;
      background: rgba(255, 255, 255, 0.15);
    }
    
    &.error {
      border-color: #f44336;
    }
  }
  
  .form-textarea {
    resize: vertical;
    min-height: 120px;
  }
  
  .error-text {
    color: #f44336;
    font-size: 0.85rem;
    margin-top: 5px;
    display: block;
  }
}

.submit-btn {
  width: 100%;
  padding: 18px 30px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a5a);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  
  &:hover:not(:disabled) {
    background: linear-gradient(45deg, #ee5a5a, #dd4a4a);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  &.loading {
    background: linear-gradient(45deg, #999, #888);
  }
  
  i {
    margin-right: 8px;
  }
}

// Info Section
.info-card, .faq-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;
}

.info-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 25px;
  text-align: center;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 25px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.info-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 107, 107, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
  
  i {
    font-size: 1.2rem;
    color: #ff6b6b;
  }
}

.info-content {
  h4 {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 1.1rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    margin: 4px 0;
    font-size: 0.95rem;
  }
}

.faq-item {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 1rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
}

// Responsive Design
@media (max-width: 1024px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .contact-info-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .contact-hero {
    padding: 60px 0 40px;
  }
  
  .contact-title {
    font-size: 2.5rem;
  }
  
  .contact-subtitle {
    font-size: 1.1rem;
  }
  
  .form-card, .info-card, .faq-card {
    padding: 25px;
  }
  
  .container {
    padding: 0 15px;
  }
}

@media (max-width: 480px) {
  .contact-title {
    font-size: 2rem;
  }
  
  .form-card, .info-card, .faq-card {
    padding: 20px;
  }
  
  .info-item {
    flex-direction: column;
    text-align: center;
  }
  
  .info-icon {
    margin: 0 auto 15px;
  }
}
</style> 