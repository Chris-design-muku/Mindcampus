/* =========================================================
   MINDCAMPUS - COMPLETE SCRIPT
   Matches the current index.html exactly
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
  "https://tfidkfvuzsfvebstbgcv.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_KToTfVS_FwufyHAn1QUzwQ_rRdYqyIx";

const sb = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let user = null;
let signupMode = false;
let selectedMood = null;


/* =========================================================
   SHORTCUTS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


function show(id) {
  const element = $(id);

  if (element) {
    element.classList.remove("hidden");
  }
}


function hide(id) {
  const element = $(id);

  if (element) {
    element.classList.add("hidden");
  }
}


function closeModals() {

  document
    .querySelectorAll(".modal")
    .forEach(modal => {
      modal.classList.add("hidden");
    });

}


/* =========================================================
   AUTH MODAL
   ========================================================= */

function openAuth(isSignup) {

  signupMode = isSignup;

  if ($("authEyebrow")) {
    $("authEyebrow").textContent =
      signupMode
        ? "START YOUR PRIVATE SPACE"
        : "WELCOME BACK";
  }


  if ($("authTitle")) {
    $("authTitle").textContent =
      signupMode
        ? "Create your MindCampus account"
        : "Log in to MindCampus";
  }


  /* Show/hide signup fields */

  if ($("nameWrap")) {
    $("nameWrap").classList.toggle(
      "hidden",
      !signupMode
    );
  }


  if ($("collegeWrap")) {
    $("collegeWrap").classList.toggle(
      "hidden",
      !signupMode
    );
  }


  /* Change submit button */

  const authButton =
    $("authForm")?.querySelector(
      "button[type='submit']"
    );


  if (authButton) {

    authButton.textContent =
      signupMode
        ? "Create account"
        : "Log in";

  }


  /* Change switch text */

  if ($("switch")) {

    $("switch").textContent =
      signupMode
        ? "Already have an account? Log in"
        : "New here? Create an account";

  }


  if ($("authMsg")) {
    $("authMsg").textContent = "";
  }


  closeModals();

  show("auth");

}


/* =========================================================
   AUTH BUTTONS
   ========================================================= */

$("loginBtn")?.addEventListener(
  "click",
  () => openAuth(false)
);


$("signupBtn")?.addEventListener(
  "click",
  () => openAuth(true)
);


$("heroSignup")?.addEventListener(
  "click",
  () => openAuth(true)
);


$("heroLogin")?.addEventListener(
  "click",
  () => openAuth(false)
);


$("cta")?.addEventListener(
  "click",
  () => openAuth(true)
);


$("switch")?.addEventListener(
  "click",
  () => openAuth(!signupMode)
);


/* =========================================================
   CLOSE BUTTONS
   ========================================================= */

document
  .querySelectorAll("[data-close]")
  .forEach(button => {

    button.addEventListener(
      "click",
      closeModals
    );

  });


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
   ========================================================= */

document
  .querySelectorAll(".modal")
  .forEach(modal => {

    modal.addEventListener(
      "click",
      event => {

        if (event.target === modal) {
          closeModals();
        }

      }
    );

  });


/* =========================================================
   LOGIN / SIGNUP FORM
   ========================================================= */

$("authForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const email =
      $("email")?.value.trim() || "";

    const password =
      $("password")?.value || "";


    if ($("authMsg")) {
      $("authMsg").textContent =
        "Please wait…";
    }


    try {

      /* -----------------------------------------
         SIGN UP
         ----------------------------------------- */

      if (signupMode) {

        const name =
          $("name")?.value.trim() || "";

        const college =
          $("college")?.value.trim() || "";


        const response =
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


        if (response.error) {
          throw response.error;
        }


        /*
         If email confirmation is enabled,
         Supabase won't give us a session yet.
        */

        if (!response.data.session) {

          $("authMsg").textContent =
            "Account created. Check your email, then log in.";

          return;

        }

      }


      /* -----------------------------------------
         LOGIN
         ----------------------------------------- */

      else {

        const response =
          await sb.auth.signInWithPassword({

            email: email,

            password: password

          });


        if (response.error) {
          throw response.error;
        }

      }


      /* -----------------------------------------
         GET CURRENT USER
         ----------------------------------------- */

      const sessionResponse =
        await sb.auth.getSession();


      user =
        sessionResponse
          .data
          .session
          ?.user || null;


      closeModals();

      updateNavigation();

      await loadDashboard();

    }


    catch (error) {

      console.error(
        "Authentication error:",
        error
      );


      if ($("authMsg")) {

        $("authMsg").textContent =
          error.message ||
          "Something went wrong.";

      }

    }

  }
);


/* =========================================================
   UPDATE NAVIGATION
   ========================================================= */

function updateNavigation() {

  if (!user) {

    show("loginBtn");
    show("signupBtn");

    hide("userMenu");

    return;

  }


  hide("loginBtn");
  hide("signupBtn");

  show("userMenu");


  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student";


  if ($("avatar")) {

    $("avatar").textContent =
      name.charAt(0).toUpperCase();

  }


  if ($("userLabel")) {

    $("userLabel").textContent =
      name;

  }

}


/* =========================================================
   USER DROPDOWN
   ========================================================= */

$("avatar")?.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    $("drop")?.classList.toggle(
      "hidden"
    );

  }
);


/* =========================================================
   DASHBOARD BUTTON IN DROPDOWN
   ========================================================= */

$("dashboardBtn")?.addEventListener(
  "click",
  async () => {

    hide("drop");

    await openDashboard();

  }
);


/* =========================================================
   LOGOUT
   ========================================================= */

$("logoutBtn")?.addEventListener(
  "click",
  async () => {

    try {

      await sb.auth.signOut();

    }

    catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }


    user = null;

    selectedMood = null;

    closeModals();

    hide("drop");

    updateNavigation();

  }
);


/* =========================================================
   OPEN DASHBOARD
   ========================================================= */

async function openDashboard() {

  if (!user) {

    openAuth(false);

    return;

  }


  closeModals();

  show("dash");

  await loadDashboard();

}


/* =========================================================
   LOAD DASHBOARD DATA
   ========================================================= */

async function loadDashboard() {

  if (!user) {
    return;
  }


  try {

    /* -----------------------------------------
       WELCOME
       ----------------------------------------- */

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


    /* -----------------------------------------
       GET CHECK-INS
       ----------------------------------------- */

    const moodResponse =
      await sb
        .from("mood_checkins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false
        })
        .limit(8);


    if (moodResponse.error) {

      console.error(
        "Mood error:",
        moodResponse.error
      );

    }


    const moods =
      moodResponse.data || [];


    /* -----------------------------------------
       GET APPOINTMENTS
       ----------------------------------------- */

    const appointmentResponse =
      await sb
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("appointment_date", {
          ascending: true
        });


    if (appointmentResponse.error) {

      console.error(
        "Appointment error:",
        appointmentResponse.error
      );

    }


    const appointments =
      appointmentResponse.data || [];


    /* -----------------------------------------
       LATEST CHECK-IN
       ----------------------------------------- */

    if (moods.length > 0) {

      $("latest").textContent =
        moods[0].mood;


      $("latestDate").textContent =
        formatDateTime(
          moods[0].created_at
        );

    }

    else {

      $("latest").textContent =
        "—";


      $("latestDate").textContent =
        "No check-ins yet";

    }


    /* -----------------------------------------
       FIND NEXT APPOINTMENT
       ----------------------------------------- */

    const now =
      new Date();


    const futureAppointments =
      appointments
        .filter(appointment => {

          if (
            !appointment.appointment_date ||
            !appointment.appointment_time
          ) {

            return false;

          }


          const appointmentDate =
            new Date(
              appointment.appointment_date +
              "T" +
              appointment.appointment_time
            );


          return appointmentDate >= now;

        })
        .sort((a, b) => {

          const dateA =
            new Date(
              a.appointment_date +
              "T" +
              a.appointment_time
            );


          const dateB =
            new Date(
              b.appointment_date +
              "T" +
              b.appointment_time
            );


          return dateA - dateB;

        });


    const nextAppointment =
      futureAppointments[0];


    /* -----------------------------------------
       UPCOMING SESSION
       ----------------------------------------- */

    if (nextAppointment) {

      $("next").textContent =
        nextAppointment.support_type;


      $("nextDate").textContent =
        formatAppointment(
          nextAppointment
        );

    }

    else {

      $("next").textContent =
        "—";


      $("nextDate").textContent =
        "No appointment booked";

    }


    /* -----------------------------------------
       HISTORY
       ----------------------------------------- */

    if (moods.length === 0) {

      $("history").innerHTML =
        "<p>No check-ins yet.</p>";

    }

    else {

      $("history").innerHTML =
        moods
          .map(item => {

            return `
              <p>
                ${escapeHTML(item.mood)}
                <span style="float:right">
                  ${formatDateOnly(item.created_at)}
                </span>
              </p>
            `;

          })
          .join("");

    }

  }

  catch (error) {

    console.error(
      "Dashboard loading error:",
      error
    );

  }

}


/* =========================================================
   REFRESH BUTTON
   ========================================================= */

$("refresh")?.addEventListener(
  "click",
  async () => {

    const button =
      $("refresh");


    const originalText =
      button.textContent;


    button.disabled = true;

    button.textContent =
      "Refreshing…";


    try {

      await loadDashboard();

    }

    catch (error) {

      console.error(error);

    }


    button.disabled = false;

    button.textContent =
      originalText;

  }
);


/* =========================================================
   MOOD BUTTONS
   ========================================================= */

document
  .querySelectorAll("[data-mood]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            "[data-mood]"
          )
          .forEach(item => {

            item.classList.remove(
              "selected"
            );

          });


        button.classList.add(
          "selected"
        );


        selectedMood =
          button.dataset.mood;


        if ($("checkMsg")) {

          $("checkMsg").textContent =
            "Selected: " +
            selectedMood;

        }

      }
    );

  });


/* =========================================================
   SAVE MOOD CHECK-IN
   ========================================================= */

$("checkin")?.addEventListener(
  "click",
  async () => {

    if (!user) {

      openAuth(true);

      return;

    }


    if (!selectedMood) {

      $("checkMsg").textContent =
        "Choose a mood first.";

      return;

    }


    $("checkin").disabled = true;

    $("checkin").textContent =
      "Saving…";


    try {

      const response =
        await sb
          .from("mood_checkins")
          .insert({

            user_id:
              user.id,

            mood:
              selectedMood

          });


      if (response.error) {
        throw response.error;
      }


      $("checkMsg").textContent =
        "Saved privately to your account ✓";


      /* Clear selection */

      document
        .querySelectorAll(
          "[data-mood]"
        )
        .forEach(button => {

          button.classList.remove(
            "selected"
          );

        });


      selectedMood = null;


      /* Refresh dashboard */

      await loadDashboard();

    }

    catch (error) {

      console.error(
        "Check-in error:",
        error
      );


      $("checkMsg").textContent =
        error.message ||
        "Could not save check-in.";

    }


    $("checkin").disabled = false;

    $("checkin").textContent =
      "Save check-in";

  }
);


/* =========================================================
   BOOKING - IMPORTANT
   ========================================================= */

/*
   This function is used by BOTH:
   1. Dashboard "Book a session"
   2. Homepage "Book a session"
*/

function openBooking() {

  if (!user) {

    openAuth(true);

    return;

  }


  /*
   Close dashboard first.
   This prevents the dashboard modal from
   sitting on top of the booking modal.
  */

  closeModals();


  /*
   Clear previous booking message.
  */

  if ($("bookMsg")) {

    $("bookMsg").textContent = "";

  }


  /*
   Open booking modal.
  */

  show("booking");

}


/* =========================================================
   DASHBOARD BOOK BUTTON
   ========================================================= */

$("bookBtn")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();

    openBooking();

  }
);


/* =========================================================
   HOMEPAGE BOOK BUTTONS
   ========================================================= */

document
  .querySelectorAll(".book")
  .forEach(button => {

    button.addEventListener(
      "click",
      event => {

        event.preventDefault();

        event.stopPropagation();

        openBooking();

      }
    );

  });


/* =========================================================
   BOOKING FORM
   ========================================================= */

$("bookingForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    if (!user) {

      openAuth(true);

      return;

    }


    const supportType =
      $("type").value;


    const appointmentDate =
      $("date").value;


    const appointmentTime =
      $("time").value;


    /* -----------------------------------------
       VALIDATION
       ----------------------------------------- */

    if (
      !supportType ||
      !appointmentDate ||
      !appointmentTime
    ) {

      $("bookMsg").textContent =
        "Please fill in all the details.";

      return;

    }


    /* -----------------------------------------
       CHECK PAST DATE/TIME
       ----------------------------------------- */

    const selectedDateTime =
      new Date(
        appointmentDate +
        "T" +
        appointmentTime
      );


    if (
      selectedDateTime <
      new Date()
    ) {

      $("bookMsg").textContent =
        "Please choose a future date and time.";

      return;

    }


    /* -----------------------------------------
       DISABLE BUTTON
       ----------------------------------------- */

    const button =
      $("bookingForm")
        .querySelector(
          "button[type='submit']"
        );


    if (button) {

      button.disabled = true;

      button.textContent =
        "Saving…";

    }


    $("bookMsg").textContent =
      "Saving your appointment…";


    try {

      /* -----------------------------------------
         SAVE TO SUPABASE
         ----------------------------------------- */

      const response =
        await sb
          .from("appointments")
          .insert({

            user_id:
              user.id,

            support_type:
              supportType,

            appointment_date:
              appointmentDate,

            appointment_time:
              appointmentTime,

            status:
              "requested"

          });


      if (response.error) {
        throw response.error;
      }


      /* -----------------------------------------
         SUCCESS
         ----------------------------------------- */

      $("bookMsg").textContent =
        "Appointment saved ✓";


      /*
       Reload dashboard immediately
      */

      await loadDashboard();


      /*
       Clear the form
      */

      $("bookingForm").reset();


      /*
       After a short delay:
       close booking and show dashboard
      */

      setTimeout(async () => {

        closeModals();

        show("dash");

        await loadDashboard();

      }, 700);

    }


    catch (error) {

      console.error(
        "Booking error:",
        error
      );


      $("bookMsg").textContent =
        error.message ||
        "Could not save appointment.";

    }


    finally {

      if (button) {

        button.disabled = false;

        button.textContent =
          "Save appointment";

      }

    }

  }
);


/* =========================================================
   INSTITUTION DEMO
   ========================================================= */

$("demo")?.addEventListener(
  "click",
  () => {

    closeModals();

    show("demoModal");

  }
);


/* =========================================================
   DEMO FORM
   ========================================================= */

$("demoForm")?.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    $("demoMsg").textContent =
      "Demo request captured ✓";


    event.target.reset();

  }
);


/* =========================================================
   DATE HELPERS
   ========================================================= */

function formatDateOnly(date) {

  try {

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  }

  catch {

    return date;

  }

}


function formatDateTime(date) {

  try {

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }
    );

  }

  catch {

    return date;

  }

}


function formatAppointment(appointment) {

  try {

    const date =
      new Date(
        appointment.appointment_date +
        "T" +
        appointment.appointment_time
      );


    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    )
    +
    " · "
    +
    date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );

  }

  catch {

    return (
      appointment.appointment_date +
      " · " +
      appointment.appointment_time
    );

  }

}


/* =========================================================
   BASIC HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   ESC KEY CLOSE
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      closeModals();

    }

  }
);


/* =========================================================
   INITIALIZE APP
   ========================================================= */

async function initializeApp() {

  try {

    const response =
      await sb.auth.getSession();


    user =
      response
        .data
        .session
        ?.user || null;


    updateNavigation();


    /*
     If already logged in, load data
     but don't automatically open dashboard.
    */

    if (user) {

      await loadDashboard();

    }


    /*
     Watch authentication changes.
    */

    sb.auth.onAuthStateChange(
      async (_event, session) => {

        user =
          session?.user || null;


        updateNavigation();

      }
    );

  }

  catch (error) {

    console.error(
      "Initialization error:",
      error
    );

  }

}


/* =========================================================
   START
   ========================================================= */

initializeApp();
