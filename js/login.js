const loginCard = document.getElementById("loginCard");
const resetCard = document.getElementById("resetCard");

const forgotBtn = document.getElementById("forgotBtn");
const backBtn = document.getElementById("backBtn");

const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberInput = document.getElementById("remember");

function clearLoginError() {
  if (loginError) {
    loginError.textContent = "";
    loginError.classList.add("hidden");
  }

  emailInput?.classList.remove("input-error");
  passwordInput?.classList.remove("input-error");
}

function showLoginError(message) {
  if (!loginError) return;

  loginError.textContent = message;
  loginError.classList.remove("hidden");

  emailInput?.classList.add("input-error");
  passwordInput?.classList.add("input-error");
}

function switchCards(showLogin) {
  if (showLogin) {
    resetCard?.classList.add("hidden");
    loginCard?.classList.remove("hidden");
    emailInput?.focus();
  } else {
    loginCard?.classList.add("hidden");
    resetCard?.classList.remove("hidden");
    document.getElementById("resetEmail")?.focus();
  }
}

// Toggle Forgot Password
forgotBtn?.addEventListener("click", () => {
  switchCards(false);
});

backBtn?.addEventListener("click", () => {
  switchCards(true);
});

emailInput?.addEventListener("input", clearLoginError);
passwordInput?.addEventListener("input", clearLoginError);

// Demo Accounts removed

// Login Logic (Demo)
loginBtn?.addEventListener("click", async () => {
  const email = emailInput?.value.trim() || "";
  const password = passwordInput?.value || "";
  const remember = !!rememberInput?.checked;

  clearLoginError();

  if (!email || !password) {
    showLoginError("Please enter your email and password.");
    return;
  }

  try {
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    const res = await fetch('api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password, remember })
    });
    const json = await res.json();
    if (json.success) {
      // Redirect to dashboard (role-aware if backend provides it)
      if (String(json.role || '').toLowerCase() === 'admin') {
        window.location.href = 'admin-dashboard.php';
      } else {
        window.location.href = 'user-dashboard.php';
      }
    } else {
      showLoginError('Incorrect email or password.');
    }
  } catch (err) {
    console.error(err);
    showLoginError('Unable to reach server. Please try again.');
  } finally {
    loginBtn.classList.remove('loading');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});
