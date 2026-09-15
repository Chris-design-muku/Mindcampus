/* =========================================================
   MINDCAMPUS — SCRIPT.JS
   ========================================================= */

/* =========================
   SUPABASE
   ========================= */

const SUPABASE_URL = "https://tfidkfvuzsfvebstbgcv.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KToTfVS_FwufyHAn1QUzwQ_rRdYqyIx";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================
   HELPERS
   ========================= */

const $ = (id) => document.getElementById(id);

function show(id) {
  const el = $(id);
  if (el) el.classList.remove("hidden");
}

function hide(id) {
  const el = $(id);
  if (el) el.classList.add("hidden");
}

function closeModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.add("hidden");
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================
   CURRENT USER
   ========================= */

let user = null;
let selectedMood = null;


/* =========================
   PAGE SWITCHING
   ========================= */

/*
   LOGGED OUT:
   Landing page visible
   Dashboard hidden

   LOGGED IN:
   Landing page hidden
   Dashboard visible
*/

function showLandingPage() {
  hide("dashboardPage");
  show("landingPage");

  closeModals();

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });
}


function showDashboardPage() {
  hide("landingPage");
  show("dashboardPage");

  closeModals();

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });
}


/* =========================
   AUTH UI
   ========================= */

function updateAuthUI() {

  if (user) {

    /* Landing page buttons */
    hide("loginBtn");
    hide("signupBtn");
    hide("heroSignup");
    hide("heroLogin");
    hide("cta");

    /* Old user menu */
    show("userMenu");

    const email =
      user.email ||
      "Student";

    const name =
      user.user_metadata?.full_name ||
      email.split("@")[0] ||
      "Student";

    if ($("userLabel")) {
      $("userLabel").textContent = name;
    }

    if ($("avatar")) {
      $("avatar").textContent =
        name.charAt(0).toUpperCase();
    }

    /* New dashboard */
    if ($("dashboardAvatar")) {
      $("dashboardAvatar").textContent =
        name.charAt(0).toUpperCase();
    }

  } else {

    /* Landing page buttons */
    show("loginBtn");
    show("signupBtn");
    show("heroSignup");
    show("heroLogin");
    show("cta");

    /* User menu */
    hide("userMenu");
  }
}


/* =========================
   OPEN AUTH
   ========================= */

function openLogin() {

  closeModals();

  show("auth");

  if ($("authEyebrow")) {
    $("authEyebrow").textContent =
      "WELCOME BACK";
  }

  if ($("authTitle")) {
    $("authTitle").textContent =
      "Log in to MindCampus";
  }

  if ($("nameWrap")) {
    $("nameWrap").classList.add("hidden");
  }

  if ($("collegeWrap")) {
    $("collegeWrap").classList.add("hidden");
  }

  const submitButton =
    $("authForm")?.querySelector("button");

  if (submitButton) {
    submitButton.textContent = "Log in";
  }

  if ($("authMsg")) {
    $("authMsg").textContent = "";
  }
}


function openSignup() {

  closeModals();

  show("auth");

  if ($("authEyebrow")) {
    $("authEyebrow").textContent =
      "WELCOME TO MINDCAMPUS";
  }

  if ($("authTitle")) {
    $("authTitle").textContent =
      "Create your MindCampus account";
  }

  if ($("nameWrap")) {
    $("nameWrap").classList.remove("hidden");
  }

  if ($("collegeWrap")) {
    $("collegeWrap").classList.remove("hidden");
  }

  const submitButton =
    $("authForm")?.querySelector("button");

  if (submitButton) {
    submitButton.textContent =
      "Create account";
  }

  if ($("authMsg")) {
    $("authMsg").textContent = "";
  }
}


/* =========================
   LOGIN / SIGNUP SWITCH
   ========================= */

let signupMode = false;

function switchAuthMode() {

  signupMode = !signupMode;

  if (signupMode) {

    if ($("authEyebrow")) {
      $("authEyebrow").textContent =
        "WELCOME TO MINDCAMPUS";
    }

    if ($("authTitle")) {
      $("authTitle").textContent =
        "Create your MindCampus account";
    }

    show("nameWrap");
    show("collegeWrap");

    const button =
      $("authForm")?.querySelector("button");

    if (button) {
      button.textContent =
        "Create account";
    }

    if ($("switch")) {
      $("switch").textContent =
        "Already have an account? Log in";
    }

  } else {

    if ($("authEyebrow")) {
      $("authEyebrow").textContent =
        "WELCOME BACK";
    }

    if ($("authTitle")) {
      $("authTitle").textContent =
        "Log in to MindCampus";
    }

    hide("nameWrap");
    hide("collegeWrap");

    const button =
      $("authForm")?.querySelector("button");

    if (button) {
      button.textContent =
        "Log in";
    }

    if ($("switch")) {
      $("switch").textContent =
        "New here? Create an account";
    }
  }

  if ($("authMsg")) {
    $("authMsg").textContent = "";
  }
}


/* =========================
   AUTH FORM
   ========================= */

$("authForm")?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const email =
      $("email")?.value.trim();

    const password =
      $("password")?.value;

    const name =
      $("name")?.value.trim();

    const college =
      $("college")?.value.trim();

    const msg =
      $("authMsg");

    if (msg) {
      msg.textContent =
        signupMode
          ? "Creating your account..."
          : "Logging you in...";
    }


    try {

      if (signupMode) {

        const { data, error } =
          await supabaseClient.auth.signUp({

            email,
            password,

            options: {
              data: {
                full_name: name,
                college: college
              }
            }

          });


        if (error) {
          throw error;
        }


        /*
           If email confirmation is enabled,
           Supabase may not immediately create
           an active session.
        */

        if (!data.session) {

          if (msg) {
            msg.textContent =
              "Account created. Please check your email to confirm your account.";
          }

          return;
        }


        user = data.user;

      } else {

        const { data, error } =
          await supabaseClient.auth.signInWithPassword({

            email,
            password

          });


        if (error) {
          throw error;
        }

        user = data.user;
      }


      /* =========================
         IMPORTANT:
         GO DIRECTLY TO FULL
         DASHBOARD SCREEN
         ========================= */

      closeModals();

      updateAuthUI();

      showDashboardPage();

      await loadDashboard();


    } catch (error) {

      console.error(error);

      if (msg) {
        msg.textContent =
          error.message ||
          "Something went wrong.";
      }
    }

  }
);


/* =========================
   LOGOUT
   ========================= */

async function logoutUser() {

  try {

    await supabaseClient.auth.signOut();

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }

  user = null;

  updateAuthUI();

  showLandingPage();
}


/* =========================
   AUTH STATE
   ========================= */

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    user =
      session?.user ||
      null;

    updateAuthUI();


    if (user) {

      /*
         IMPORTANT:
         Any valid session means
         dashboard becomes the entire page.
      */

      showDashboardPage();

      /*
         Avoid loading dashboard during
         SIGNED_IN callback before the
         browser has finished updating.
      */

      setTimeout(async () => {
        await loadDashboard();
      }, 0);

    } else {

      showLandingPage();
    }

  }
);


/* =========================
   INITIAL SESSION
   ========================= */

async function initializeApp() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {
      throw error;
    }


    user =
      data.session?.user ||
      null;


    updateAuthUI();


    if (user) {

      /*
         Refresh while logged in:
         dashboard stays the main screen.
      */

      showDashboardPage();

      await loadDashboard();

    } else {

      showLandingPage();

    }

  } catch (error) {

    console.error(
      "Session error:",
      error
    );

    user = null;

    updateAuthUI();

    showLandingPage();
  }
}


/* =========================
   DASHBOARD
   ========================= */

async function loadDashboard() {

  if (!user) {
    return;
  }

  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student";


  if ($("welcome")) {

    $("welcome").textContent =
      `Welcome back, ${name} 👋`;

  }


  if ($("dashboardAvatar")) {

    $("dashboardAvatar").textContent =
      name.charAt(0).toUpperCase();

  }


  await Promise.all([
    loadCheckins(),
    loadAppointments(),
    loadSavedContacts()
  ]);

}


/* =========================
   CHECK-IN MOOD SELECTION
   ========================= */

document.querySelectorAll(
  ".moods button"
).forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      selectedMood =
        button.dataset.mood;


      document
        .querySelectorAll(".moods button")
        .forEach((btn) => {

          btn.style.transform =
            "scale(1)";

          btn.style.border =
            "";

        });


      button.style.transform =
        "scale(1.08)";

      button.style.border =
        "2px solid var(--accent)";
    }
  );

});


/* =========================
   SAVE CHECK-IN
   ========================= */

$("checkin")?.addEventListener(
  "click",
  async () => {

    if (!user) {

      openLogin();

      return;
    }


    if (!selectedMood) {

      if ($("checkMsg")) {
        $("checkMsg").textContent =
          "Please choose how you're feeling first.";
      }

      return;
    }


    if ($("checkMsg")) {
      $("checkMsg").textContent =
        "Saving...";
    }


    try {

      const { error } =
        await supabaseClient
          .from("mood_checkins")
          .insert({

            user_id: user.id,
            mood: selectedMood

          });


      if (error) {
        throw error;
      }


      if ($("checkMsg")) {
        $("checkMsg").textContent =
          "Check-in saved ✓";
      }


      selectedMood = null;


      document
        .querySelectorAll(".moods button")
        .forEach((btn) => {

          btn.style.transform =
            "scale(1)";

          btn.style.border =
            "";

        });


      await loadCheckins();


    } catch (error) {

      console.error(error);

      if ($("checkMsg")) {
        $("checkMsg").textContent =
          error.message ||
          "Could not save check-in.";
      }

    }

  }
);


/* =========================
   LOAD CHECK-INS
   ========================= */

async function loadCheckins() {

  if (!user) {
    return;
  }


  try {

    const { data, error } =
      await supabaseClient
        .from("mood_checkins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false
        });


    if (error) {
      throw error;
    }


    const checkins =
      data || [];


    /* Latest */

    if (checkins.length > 0) {

      const latest =
        checkins[0];


      if ($("latest")) {
        $("latest").textContent =
          latest.mood;
      }


      if ($("latestDate")) {

        $("latestDate").textContent =
          formatDate(latest.created_at);

      }

    } else {

      if ($("latest")) {
        $("latest").textContent =
          "—";
      }

      if ($("latestDate")) {
        $("latestDate").textContent =
          "No check-ins yet";
      }

    }


    /* History */

    const history =
      $("history");


    if (!history) {
      return;
    }


    if (!checkins.length) {

      history.innerHTML =
        `<p class="hint">No check-ins yet.</p>`;

      return;
    }


    history.innerHTML =
      checkins
        .slice(0, 10)
        .map((item) => {

          return `
            <div class="contact-card">
              <div>
                <strong>
                  ${escapeHtml(item.mood)}
                </strong>

                <span>
                  ${escapeHtml(
                    formatDate(item.created_at)
                  )}
                </span>
              </div>

              <div>
                <small>✓ Saved</small>
              </div>
            </div>
          `;

        })
        .join("");


  } catch (error) {

    console.error(
      "Check-in loading error:",
      error
    );

  }

}


/* =========================
   APPOINTMENT
   ========================= */

$("bookBtn")?.addEventListener(
  "click",
  () => {

    if (!user) {
      openLogin();
      return;
    }

    closeModals();

    show("booking");

  }
);


/* Landing page booking buttons */

document
  .querySelectorAll(".book")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        if (!user) {

          openLogin();

        } else {

          closeModals();

          show("booking");

        }

      }
    );

  });


/* =========================
   SAVE APPOINTMENT
   ========================= */

$("bookingForm")?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    if (!user) {

      openLogin();

      return;
    }


    const type =
      $("type")?.value;

    const date =
      $("date")?.value;

    const time =
      $("time")?.value;


    if ($("bookMsg")) {
      $("bookMsg").textContent =
        "Saving appointment...";
    }


    try {

      const { error } =
        await supabaseClient
          .from("appointments")
          .insert({

            user_id: user.id,
            type: type,
            date: date,
            time: time

          });


      if (error) {
        throw error;
      }


      if ($("bookMsg")) {
        $("bookMsg").textContent =
          "Appointment saved ✓";
      }


      await loadAppointments();


      setTimeout(() => {

        closeModals();

      }, 700);


    } catch (error) {

      console.error(error);

      if ($("bookMsg")) {
        $("bookMsg").textContent =
          error.message ||
          "Could not save appointment.";
      }

    }

  }
);


/* =========================
   LOAD APPOINTMENTS
   ========================= */

async function loadAppointments() {

  if (!user) {
    return;
  }


  try {

    const { data, error } =
      await supabaseClient
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("date", {
          ascending: true
        });


    if (error) {
      throw error;
    }


    const appointments =
      data || [];


    if (!appointments.length) {

      if ($("next")) {
        $("next").textContent =
          "—";
      }

      if ($("nextDate")) {
        $("nextDate").textContent =
          "No appointment booked";
      }

      return;
    }


    const upcoming =
      appointments[0];


    if ($("next")) {
      $("next").textContent =
        upcoming.type ||
        "Support session";
    }


    if ($("nextDate")) {

      $("nextDate").textContent =
        `${upcoming.date || ""} · ${upcoming.time || ""}`;

    }


  } catch (error) {

    console.error(
      "Appointment loading error:",
      error
    );

  }

}


/* =========================
   SAVED CONTACTS
   ========================= */

$("contactForm")?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    if (!user) {

      openLogin();

      return;
    }


    const name =
      $("contactName")?.value.trim();

    const relationship =
      $("contactRelation")?.value.trim();

    const phone =
      $("contactPhone")?.value.trim();


    if (!name || !relationship || !phone) {

      if ($("contactMsg")) {
        $("contactMsg").textContent =
          "Please fill in all contact details.";
      }

      return;
    }


    if ($("contactMsg")) {
      $("contactMsg").textContent =
        "Saving contact...";
    }


    try {

      const { error } =
        await supabaseClient
          .from("saved_contacts")
          .insert({

            user_id: user.id,
            name: name,
            relationship: relationship,
            phone: phone

          });


      if (error) {
        throw error;
      }


      $("contactForm").reset();


      if ($("contactMsg")) {
        $("contactMsg").textContent =
          "Contact saved ✓";
      }


      await loadSavedContacts();


    } catch (error) {

      console.error(
        "Contact saving error:",
        error
      );


      if ($("contactMsg")) {
        $("contactMsg").textContent =
          error.message ||
          "Could not save contact.";
      }

    }

  }
);


/* =========================
   LOAD SAVED CONTACTS
   ========================= */

async function loadSavedContacts() {

  if (!user) {
    return;
  }


  const container =
    $("savedContacts");


  if (!container) {
    return;
  }


  try {

    const { data, error } =
      await supabaseClient
        .from("saved_contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false
        });


    if (error) {
      throw error;
    }


    const contacts =
      data || [];


    if (!contacts.length) {

      container.innerHTML =
        `<p class="hint">No saved contacts yet.</p>`;

      return;
    }


    container.innerHTML =
      contacts
        .map((contact) => {

          return `
            <div class="contact-card">

              <div>

                <strong>
                  ${escapeHtml(contact.name)}
                </strong>

                <span>
                  ${escapeHtml(
                    contact.relationship
                  )}
                  ·
                  ${escapeHtml(
                    contact.phone
                  )}
                </span>

              </div>


              <div>

                <small>
                  ✓ Saved
                </small>

                <button
                  class="btn soft remove-contact"
                  data-id="${escapeHtml(contact.id)}"
                >
                  Remove
                </button>

              </div>

            </div>
          `;

        })
        .join("");


    /* Remove buttons */

    container
      .querySelectorAll(
        ".remove-contact"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          async () => {

            await removeContact(
              button.dataset.id
            );

          }
        );

      });


  } catch (error) {

    console.error(
      "Saved contacts loading error:",
      error
    );


    container.innerHTML =
      `<p class="hint">
        Could not load saved contacts.
      </p>`;

  }

}


/* =========================
   REMOVE CONTACT
   ========================= */

async function removeContact(id) {

  if (!user || !id) {
    return;
  }


  try {

    const { error } =
      await supabaseClient
        .from("saved_contacts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);


    if (error) {
      throw error;
    }


    await loadSavedContacts();


  } catch (error) {

    console.error(
      "Contact removal error:",
      error
    );

  }

}


/* =========================
   REFRESH DASHBOARD
   ========================= */

$("refresh")?.addEventListener(
  "click",
  async () => {

    if (!user) {
      return;
    }


    const button =
      $("refresh");


    if (button) {
      button.textContent =
        "Refreshing...";
      button.disabled = true;
    }


    await loadDashboard();


    if (button) {

      button.textContent =
        "Refresh";

      button.disabled =
        false;

    }

  }
);


/* =========================
   OLD PROFILE MENU
   ========================= */

$("avatar")?.addEventListener(
  "click",
  () => {

    if ($("drop")) {
      $("drop").classList.toggle(
        "hidden"
      );
    }

  }
);


$("dashboardBtn")?.addEventListener(
  "click",
  () => {

    if (!user) {
      openLogin();
      return;
    }

    showDashboardPage();

    loadDashboard();

  }
);


/* =========================
   NEW DASHBOARD LOGOUT
   ========================= */

$("dashboardLogout")?.addEventListener(
  "click",
  async () => {

    await logoutUser();

  }
);


/* =========================
   DASHBOARD BRAND
   ========================= */

$("dashboardBrand")?.addEventListener(
  "click",
  (event) => {

    event.preventDefault();

    if (user) {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }

  }
);


/* =========================
   LANDING LOGIN BUTTONS
   ========================= */

$("loginBtn")?.addEventListener(
  "click",
  () => {

    signupMode = false;

    openLogin();

  }
);


$("heroLogin")?.addEventListener(
  "click",
  () => {

    signupMode = false;

    openLogin();

  }
);


/* =========================
   LANDING SIGNUP BUTTONS
   ========================= */

$("signupBtn")?.addEventListener(
  "click",
  () => {

    signupMode = true;

    openSignup();

  }
);


$("heroSignup")?.addEventListener(
  "click",
  () => {

    signupMode = true;

    openSignup();

  }
);


$("cta")?.addEventListener(
  "click",
  () => {

    signupMode = true;

    openSignup();

  }
);


/* =========================
   AUTH SWITCH BUTTON
   ========================= */

$("switch")?.addEventListener(
  "click",
  () => {

    switchAuthMode();

  }
);


/* =========================
   CLOSE BUTTONS
   ========================= */

document
  .querySelectorAll("[data-close]")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        closeModals();

      }
    );

  });


/* =========================
   CLICK OUTSIDE MODAL
   ========================= */

document
  .querySelectorAll(".modal")
  .forEach((modal) => {

    modal.addEventListener(
      "click",
      (event) => {

        if (
          event.target === modal
        ) {

          closeModals();

        }

      }
    );

  });


/* =========================
   INSTITUTION DEMO
   ========================= */

$("demo")?.addEventListener(
  "click",
  () => {

    closeModals();

    show("demoModal");

  }
);


$("demoForm")?.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    if ($("demoMsg")) {

      $("demoMsg").textContent =
        "Thanks! We'll get in touch with your institution.";

    }

  }
);


/* =========================
   DATE FORMATTER
   ========================= */

function formatDate(dateValue) {

  if (!dateValue) {
    return "Unknown date";
  }


  try {

    const date =
      new Date(dateValue);


    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  } catch {

    return String(dateValue);

  }

}


/* =========================
   START APP
   ========================= */

initializeApp();
