// =========================================================
// MINDCAMPUS — COMPLETE SCRIPT
// Existing functionality + Saved Contacts
// =========================================================


// =========================================================
// SUPABASE CONFIGURATION
// =========================================================

const SUPABASE_URL =
  "https://tfidkfvuzsfvebstbgcv.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_KToTfVS_FwufyHAn1QUzwQ_rRdYqyIx";

const ready =
  !SUPABASE_URL.startsWith("YOUR_") &&
  !SUPABASE_ANON_KEY.startsWith("YOUR_");

const sb = ready
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;


// =========================================================
// GLOBAL VARIABLES
// =========================================================

let user = null;
let signup = false;
let mood = null;


// =========================================================
// HELPER FUNCTIONS
// =========================================================

const $ = id => document.getElementById(id);

const show = id => {
  const el = $(id);
  if (el) el.classList.remove("hidden");
};

const hide = id => {
  const el = $(id);
  if (el) el.classList.add("hidden");
};

const closeModals = () => {
  document.querySelectorAll(".modal").forEach(modal => {
    modal.classList.add("hidden");
  });
};


// =========================================================
// AUTH MODE
// =========================================================

function authMode(isSignup) {

  signup = isSignup;

  $("authEyebrow").textContent =
    signup ? "START YOUR PRIVATE SPACE" : "WELCOME BACK";

  $("authTitle").textContent =
    signup
      ? "Create your MindCampus account"
      : "Log in to MindCampus";

  document
    .querySelectorAll("#nameWrap,#collegeWrap")
    .forEach(el => {
      el.classList.toggle("hidden", !signup);
    });

  $("authForm").querySelector("button").textContent =
    signup ? "Create account" : "Log in";

  $("switch").textContent =
    signup
      ? "Already have an account? Log in"
      : "New here? Create an account";

  $("authMsg").textContent = "";

  show("auth");
}


// =========================================================
// LOGIN / SIGNUP BUTTONS
// =========================================================

$("loginBtn")?.addEventListener("click", () => {
  authMode(false);
});

$("signupBtn")?.addEventListener("click", () => {
  authMode(true);
});

$("heroSignup")?.addEventListener("click", () => {
  authMode(true);
});

$("heroLogin")?.addEventListener("click", () => {
  authMode(false);
});

$("cta")?.addEventListener("click", () => {
  authMode(true);
});

$("switch")?.addEventListener("click", () => {
  authMode(!signup);
});


// =========================================================
// CLOSE BUTTONS / MODALS
// =========================================================

document.querySelectorAll("[data-close]").forEach(button => {

  button.addEventListener("click", closeModals);

});


document.querySelectorAll(".modal").forEach(modal => {

  modal.addEventListener("click", event => {

    if (event.target === modal) {
      closeModals();
    }

  });

});


// =========================================================
// AUTH FORM
// =========================================================

$("authForm")?.addEventListener("submit", async event => {

  event.preventDefault();

  if (!sb) {

    $("authMsg").textContent =
      "Connect Supabase first.";

    return;
  }

  $("authMsg").textContent =
    "Please wait…";


  try {

    // -----------------------------------------------------
    // SIGN UP
    // -----------------------------------------------------

    if (signup) {

      const name =
        $("name").value.trim();

      const college =
        $("college").value.trim();

      const email =
        $("email").value.trim();

      const password =
        $("password").value;


      const result =
        await sb.auth.signUp({

          email: email,

          password: password,

          options: {
            data: {
              full_name: name,
              college: college
            }
          }

        });


      if (result.error) {
        throw result.error;
      }


      // Email confirmation enabled
      if (!result.data.session) {

        $("authMsg").textContent =
          "Account created. Check your email, then log in.";

        return;
      }

    }


    // -----------------------------------------------------
    // LOGIN
    // -----------------------------------------------------

    else {

      const result =
        await sb.auth.signInWithPassword({

          email: $("email").value.trim(),

          password: $("password").value

        });


      if (result.error) {
        throw result.error;
      }

    }


    // -----------------------------------------------------
    // GET CURRENT SESSION
    // -----------------------------------------------------

    const sessionResult =
      await sb.auth.getSession();

    user =
      sessionResult.data.session?.user || null;


    closeModals();

    ui();

    if (user) {
      dash();
    }


  } catch (error) {

    $("authMsg").textContent =
      error.message ||
      "Something went wrong.";

  }

});


// =========================================================
// USER INTERFACE AFTER LOGIN
// =========================================================

async function ui() {

  // -------------------------------------------------------
  // LOGGED OUT
  // -------------------------------------------------------

  if (!user) {

    hide("userMenu");

    show("loginBtn");
    show("signupBtn");

    return;
  }


  // -------------------------------------------------------
  // LOGGED IN
  // -------------------------------------------------------

  hide("loginBtn");
  hide("signupBtn");

  show("userMenu");


  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student";


  $("avatar").textContent =
    name[0].toUpperCase();

  $("userLabel").textContent =
    name;


  // -------------------------------------------------------
  // IMPORTANT:
  // Remove/hide account creation buttons after login
  // -------------------------------------------------------

  hide("signupBtn");

}


// =========================================================
// USER DROPDOWN
// =========================================================

$("avatar")?.addEventListener("click", event => {

  event.stopPropagation();

  $("drop")?.classList.toggle("hidden");

});


document.addEventListener("click", event => {

  const drop = $("drop");
  const avatar = $("avatar");

  if (
    drop &&
    avatar &&
    !drop.contains(event.target) &&
    !avatar.contains(event.target)
  ) {

    drop.classList.add("hidden");

  }

});


// =========================================================
// DASHBOARD BUTTON
// =========================================================

$("dashboardBtn")?.addEventListener("click", () => {

  hide("drop");

  dash();

});


// =========================================================
// LOGOUT
// =========================================================

$("logoutBtn")?.addEventListener("click", async () => {

  if (sb) {
    await sb.auth.signOut();
  }

  user = null;

  ui();

  closeModals();

});


// =========================================================
// MOOD SELECTION
// =========================================================

document
  .querySelectorAll("[data-mood]")
  .forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll("[data-mood]")
        .forEach(item => {
          item.classList.remove("selected");
        });


      button.classList.add("selected");

      mood =
        button.dataset.mood;


      if ($("checkMsg")) {

        $("checkMsg").textContent =
          "Selected: " + mood;

      }

    });

  });


// =========================================================
// SAVE MOOD CHECK-IN
// =========================================================

$("checkin")?.addEventListener("click", async () => {

  if (!user) {

    authMode(true);

    return;
  }


  if (!mood) {

    $("checkMsg").textContent =
      "Choose a mood first.";

    return;
  }


  const result =
    await sb
      .from("mood_checkins")
      .insert({

        user_id: user.id,

        mood: mood

      });


  if (result.error) {

    $("checkMsg").textContent =
      result.error.message;

    return;
  }


  $("checkMsg").textContent =
    "Saved privately to your account ✓";


  await loadDash();

});


// =========================================================
// DASHBOARD
// =========================================================

async function dash() {

  if (!user) {

    authMode(false);

    return;
  }


  show("dash");

  await loadDash();

}


// =========================================================
// REFRESH DASHBOARD
// =========================================================

$("refresh")?.addEventListener("click", async () => {

  await loadDash();

});


// =========================================================
// LOAD DASHBOARD DATA
// =========================================================

async function loadDash() {

  if (!sb || !user) {
    return;
  }


  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student";


  if ($("welcome")) {

    $("welcome").textContent =
      "Welcome back, " +
      name.split(" ")[0] +
      " 👋";

  }


  // -------------------------------------------------------
  // MOOD CHECK-INS
  // -------------------------------------------------------

  const moodResult =
    await sb
      .from("mood_checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false
      })
      .limit(8);


  // -------------------------------------------------------
  // APPOINTMENTS
  // -------------------------------------------------------

  const appointmentResult =
    await sb
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("appointment_date", {
        ascending: true
      });


  const moods =
    moodResult.data || [];

  const appointments =
    appointmentResult.data || [];


  // -------------------------------------------------------
  // LATEST MOOD
  // -------------------------------------------------------

  if ($("latest")) {

    $("latest").textContent =
      moods[0]?.mood || "—";

  }


  if ($("latestDate")) {

    $("latestDate").textContent =
      moods[0]
        ? new Date(
            moods[0].created_at
          ).toLocaleString()
        : "No check-ins yet";

  }


  // -------------------------------------------------------
  // UPCOMING APPOINTMENT
  // -------------------------------------------------------

  const now = new Date();


  const nextAppointment =
    appointments.find(appointment => {

      const appointmentDate =
        new Date(
          appointment.appointment_date +
          "T" +
          appointment.appointment_time
        );

      return appointmentDate >= now;

    });


  if ($("next")) {

    $("next").textContent =
      nextAppointment?.support_type ||
      "—";

  }


  if ($("nextDate")) {

    $("nextDate").textContent =
      nextAppointment
        ? nextAppointment.appointment_date +
          " · " +
          nextAppointment.appointment_time
        : "No appointment booked";

  }


  // -------------------------------------------------------
  // CHECK-IN HISTORY
  // -------------------------------------------------------

  if ($("history")) {

    if (moods.length) {

      $("history").innerHTML =
        moods.map(item => {

          return `
            <p>
              ${escapeHtml(item.mood)}
              <span style="float:right">
                ${new Date(
                  item.created_at
                ).toLocaleDateString()}
              </span>
            </p>
          `;

        }).join("");

    }

    else {

      $("history").innerHTML =
        "<p>No check-ins yet.</p>";

    }

  }


  // -------------------------------------------------------
  // SAVED CONTACTS
  // -------------------------------------------------------

  await loadSavedContacts();

}


// =========================================================
// BOOKING
// =========================================================

function openBooking() {

  closeModals();

  show("booking");

}


// Dashboard booking button

$("bookBtn")?.addEventListener("click", event => {

  event.preventDefault();

  event.stopPropagation();

  if (!user) {

    authMode(true);

    return;
  }

  openBooking();

});


// Support section booking buttons

document
  .querySelectorAll(".book")
  .forEach(button => {

    button.addEventListener("click", event => {

      event.preventDefault();

      if (!user) {

        authMode(true);

        return;
      }

      openBooking();

    });

  });


// =========================================================
// BOOKING FORM
// =========================================================

$("bookingForm")?.addEventListener("submit", async event => {

  event.preventDefault();


  if (!user) {

    authMode(false);

    return;
  }


  if (!sb) {

    $("bookMsg").textContent =
      "Supabase is not connected.";

    return;
  }


  $("bookMsg").textContent =
    "Saving appointment...";


  const result =
    await sb
      .from("appointments")
      .insert({

        user_id: user.id,

        support_type:
          $("type").value,

        appointment_date:
          $("date").value,

        appointment_time:
          $("time").value,

        status:
          "requested"

      });


  if (result.error) {

    $("bookMsg").textContent =
      result.error.message;

    return;
  }


  $("bookMsg").textContent =
    "Appointment saved ✓";


  setTimeout(() => {

    closeModals();

    dash();

  }, 700);

});


// =========================================================
// INSTITUTION DEMO
// =========================================================

$("demo")?.addEventListener("click", () => {

  show("demoModal");

});


$("demoForm")?.addEventListener("submit", event => {

  event.preventDefault();

  $("demoMsg").textContent =
    "Demo request captured ✓";

  event.target.reset();

});


// =========================================================
// SAVED PEER CONTACTS
// =========================================================


// Load contacts from Supabase

async function loadSavedContacts() {

  if (!sb || !user) {
    return;
  }


  const box =
    $("savedContacts");


  if (!box) {
    return;
  }


  const result =
    await sb
      .from("saved_contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false
      });


  if (result.error) {

    box.innerHTML =
      "<p>Unable to load saved contacts.</p>";

    return;
  }


  const contacts =
    result.data || [];


  // No contacts yet

  if (!contacts.length) {

    box.innerHTML =
      "<p>No saved contacts yet.</p>";

    return;
  }


  // Display contacts

  box.innerHTML =
    contacts.map(contact => {

      return `
        <div class="contact-card">

          <div>

            <strong>
              ${escapeHtml(contact.name)}
            </strong>

            <span>
              ${escapeHtml(
                contact.relationship || "Contact"
              )}
              ·
              ${escapeHtml(contact.phone)}
            </span>

            <small>
              ✓ Saved
            </small>

          </div>


          <div>

            <a
              class="btn soft"
              href="tel:${escapeHtml(contact.phone)}"
            >
              Call
            </a>


            <button
              class="btn ghost delete-contact"
              data-id="${contact.id}"
            >
              Remove
            </button>

          </div>

        </div>
      `;

    }).join("");


  // -------------------------------------------------------
  // REMOVE CONTACT
  // -------------------------------------------------------

  document
    .querySelectorAll(".delete-contact")
    .forEach(button => {

      button.addEventListener("click", async () => {

        const id =
          button.dataset.id;


        const result =
          await sb
            .from("saved_contacts")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);


        if (result.error) {

          if ($("contactMsg")) {

            $("contactMsg").textContent =
              result.error.message;

          }

          return;
        }


        if ($("contactMsg")) {

          $("contactMsg").textContent =
            "Contact removed.";

        }


        await loadSavedContacts();

      });

    });

}


// =========================================================
// ADD NEW PEER CONTACT
// =========================================================

$("contactForm")?.addEventListener("submit", async event => {

  event.preventDefault();


  if (!user) {

    authMode(true);

    return;
  }


  if (!sb) {

    $("contactMsg").textContent =
      "Supabase is not connected.";

    return;
  }


  const name =
    $("contactName").value.trim();

  const relationship =
    $("contactRelation").value;

  const phone =
    $("contactPhone").value.trim();


  if (!name || !phone) {

    $("contactMsg").textContent =
      "Please enter a name and phone number.";

    return;
  }


  $("contactMsg").textContent =
    "Saving contact...";


  const result =
    await sb
      .from("saved_contacts")
      .insert({

        user_id: user.id,

        name: name,

        relationship: relationship,

        phone: phone

      });


  if (result.error) {

    $("contactMsg").textContent =
      result.error.message;

    return;
  }


  $("contactMsg").textContent =
    "Contact saved ✓";


  $("contactForm").reset();


  await loadSavedContacts();

});


// =========================================================
// SECURITY / HTML ESCAPING
// =========================================================

function escapeHtml(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


// =========================================================
// INITIALIZE APPLICATION
// =========================================================

(async function initialize() {

  if (sb) {

    const sessionResult =
      await sb.auth.getSession();

    user =
      sessionResult.data.session?.user ||
      null;


    // Listen for login/logout

    sb.auth.onAuthStateChange(
      (_event, session) => {

        user =
          session?.user || null;

        ui();

      }
    );

  }


  await ui();

})();
