<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>E-REPORT | Login</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <div class="login-scene" aria-hidden="true">
    <span class="scene-orb orb-a"></span>
    <span class="scene-orb orb-b"></span>
    <span class="scene-orb orb-c"></span>
    <span class="scene-grid"></span>
  </div>

  <div class="container">

    <div class="header">
      <img src="assets/spusm-logo.png" alt="SPUSM Logo" class="logo">
      <h1>St. Paul University</h1>
      <h2>at San Miguel</h2>
      <p class="subtitle">E-REPORT: Web-Based Service Request and Action Tracking</p>
    </div>

    <div class="auth-shell">
      <div class="auth-info">
        <h3>Secure Campus Reporting</h3>
        <p>Manage reports, monitor updates, and keep student concerns confidential with a secure workflow.</p>
        <ul>
          <li>Anonymous reporting support</li>
          <li>Role-based access for students and admins</li>
          <li>Real-time status tracking and notifications</li>
        </ul>
      </div>

      <div class="auth-panel">
        <div class="card" id="loginCard">
          <h3>Welcome Back</h3>
          <p class="description">Sign in to access the report system</p>
          <p class="auth-error hidden" id="loginError" role="alert" aria-live="assertive"></p>

          <label for="email">Email Address</label>
          <input type="email" id="email" placeholder="your.email@spusm.edu.ph" autocomplete="email">

          <label for="password">Password</label>
          <input type="password" id="password" placeholder="••••••••" autocomplete="current-password">

          <div class="row">
            <label class="remember-wrap" for="remember">
              <input type="checkbox" id="remember">
              <span class="small">Remember me</span>
            </label>
            <button class="link-btn" id="forgotBtn" type="button">Forgot password?</button>
          </div>

          <button class="primary-btn" id="loginBtn" type="button">Sign In</button>
        </div>

        <div class="card hidden" id="resetCard">
          <h3>Reset Password</h3>
          <p class="description">Enter your email to receive reset instructions</p>

          <label for="resetEmail">Email Address</label>
          <input type="email" id="resetEmail" placeholder="your.email@spusm.edu.ph" autocomplete="email">

          <button class="primary-btn" type="button">Send Reset Link</button>
          <button class="outline-btn" id="backBtn" type="button">Back to Login</button>

          <p class="note">
            You will receive an email with instructions to reset your password securely.
          </p>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-card">
        <p class="footer-title">Secure & Confidential</p>
        <ul>
          <li>End-to-end encryption</li>
          <li>Anonymous reporting available</li>
          <li>Session-based privacy protection</li>
        </ul>
      </div>

      <p class="copyright">
        © 2026 St. Paul University at San Miguel | San Miguel, Bulacan
      </p>
    </div>

  </div>

  <script src="js/login.js"></script>
</body>
</html>

