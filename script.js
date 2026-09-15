/* =========================================================
   MINDCAMPUS - COMPLETE JAVASCRIPT
   Compatible with current MindCampus HTML
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
  "https://tfidkfvuzsfvebstbgcv.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_KToTfVS_FwufyHAn1QUzwQ_rRdYqyIx";

const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}

function show(id) {
  const el = $(id);
  if (el) {
    el.classList.remove("hidden");
  }
}

function hide(id) {
  const el = $(id);
  if (el) {
    el.classList.add("hidden");
  }
}

function setText(id, text) {
  const el = $(id);
  if (el) {
    el.textContent = text;
  }
}

function closeModals() {
  document.querySelectorAll(".modal").forEach(modal => {
    modal.classList.add("hidden");
  });
}


/* =========================================================
   VARIABLES
   ========================================================= */

let user = null;
let signup = false;
let selectedMood = null;


/* =========================================================
   AUTH MODE
   ========================================================= */

function authMode(isSignup) {

  signup = isSignup;

  setText(
    "authEyebrow",
    signup
      ? "START YOUR PRIVATE SPACE"
      : "WELCOME BACK"
  );

  setText(
    "authTitle",
    signup
      ? "Create your MindCampus account"
      : "Log in to MindCampus"
  );


  document
    .querySelectorAll("#nameWrap,#collegeWrap")
    .forEach(el => {
      el.classList.toggle("hidden", !signup);
    });


  const form = $("authForm");

  if (form) {

    const button =
      form.querySelector("button[type='submit']") ||
      form.querySelector("button");

    if (button) {

      button.textContent =
        signup
          ? "Create account"
          : "Log in";

    }
  }


  setText(
    "switch",
    signup
      ? "Already have an account? Log in"
      : "New here? Create an account"
  );


  setText("authMsg", "");

  show("auth");
}


/* =========================================================
   LOGIN / SIGNUP BUTTONS
   ========================================================= */

if ($("loginBtn")) {

  $("loginBtn").onclick = () => {
    authMode(false);
  };

}

if ($("signupBtn")) {

  $("signupBtn").onclick = () => {
    authMode(true);
  };

}

if ($("heroSignup")) {

  $("heroSignup").onclick = () => {
    authMode(true);
  };

}

if ($("heroLogin")) {

  $("heroLogin").onclick = () => {
    authMode(false);
  };

}

if ($("cta")) {

  $("cta").onclick = () => {
    authMode(true);
  };

}

if ($("switch")) {

  $("switch").onclick = () => {
    authMode(!signup);
  };

}


/* =========================================================
   CLOSE BUTTONS
   ========================================================= */

document
  .querySelectorAll("[data-close]")
  .forEach(button => {

    button.onclick = () => {
      closeModals();
    };

  });


/* =========================================================
   CLICK OUTSIDE MODAL TO CLOSE
   ========================================================= */

document
  .querySelectorAll(".modal")
  .forEach(modal => {

    modal.addEventListener("click", event => {

      if (event.target === modal) {
        closeModals();
      }

    });

  });


/* =========================================================
   SIGNUP / LOGIN
   ========================================================= */

if ($("authForm")) {

  $("authForm").onsubmit = async event => {

    event.preventDefault();

    setText("authMsg", "Please wait…");


    try {

      /* -----------------------------------------
         SIGN UP
         ----------------------------------------- */

      if (signup) {

        const name =
          $("name")?.value.trim() || "";

        const college =
          $("college")?.value.trim() ||
          "XIME Chennai";

        const email =
          $("email")?.value.trim() || "";

        const password =
          $("password")?.value || "";


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
         Supabase email confirmation
        */

        if (!response.data.session) {

          setText(
            "authMsg",
            "Account created. Check your email, then log in."
          );

          return;

        }

      }


      /* -----------------------------------------
         LOGIN
         ----------------------------------------- */

      else {

        const email =
          $("email")?.value.trim() || "";

        const password =
          $("password")?.value || "";


        const response =
          await sb.auth.signInWithPassword({

            email: email,

            password: password

          });


        if (response.error) {
          throw response.error;
        }

      }


      closeModals();


      const session =
        await sb.auth.getSession();


      user =
        session.data.session?.user || null;


      await updateUI();

      await loadDashboard();

    }


    catch (error) {

      console.error(
        "Authentication error:",
        error
      );


      setText(
        "authMsg",
        error.message ||
        "Something went wrong."
      );

    }

  };

}


/* =========================================================
   UPDATE NAVIGATION UI
   ========================================================= */

async function updateUI() {

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

if ($("avatar")) {

  $("avatar").onclick = () => {

    if ($("drop")) {
      $("drop").classList.toggle("hidden");
    }

  };

}


if ($("logoutBtn")) {

  $("logoutBtn").onclick = async () => {

    try {

      await sb.auth.signOut();

    } catch (error) {

      console.error(error);

    }


    user = null;

    selectedMood = null;

    hide("drop");

    closeModals();

    await updateUI();

  };

}


/* =========================================================
   DASHBOARD BUTTON
   ========================================================= */

if ($("dashboardBtn")) {

  $("dashboardBtn").onclick = async () => {

    hide("drop");

    await openDashboard();

  };

}


/* =========================================================
   OPEN DASHBOARD
   ========================================================= */

async function openDashboard() {

  if (!user) {

    authMode(false);

    return;

  }


  show("dash");

  await loadDashboard();

}


/* =========================================================
   GET PROFILE
   ========================================================= */

async function getProfile() {

  if (!user) {
    return null;
  }


  try {

    const response =
      await sb
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();


    if (response.error) {

      console.error(
        "Profile error:",
        response.error
      );

      return null;

    }


    return response.data;

  }

  catch (error) {

    console.error(error);

    return null;

  }

}


/* =========================================================
   LOAD DASHBOARD
   ========================================================= */

async function loadDashboard() {

  if (!user) {
    return;
  }


  try {

    /* -----------------------------------------
       PROFILE
       ----------------------------------------- */

    const profile =
      await getProfile();


    const studentName =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Student";


    const college =
      profile?.college ||
      user.user_metadata?.college ||
      "XIME Chennai";


    /* -----------------------------------------
       WELCOME MESSAGE
       ----------------------------------------- */

    setText(
      "welcome",
      "Welcome back, " +
      studentName.split(" ")[0] +
      " 👋"
    );


    /* -----------------------------------------
       OPTIONAL PROFILE INFORMATION
       ----------------------------------------- */

    setText(
      "dashName",
      studentName
    );

    setText(
      "dashCollege",
      college
    );


    if ($("dashRoll")) {

      $("dashRoll").textContent =
        profile?.roll_number ||
        "Roll number not added";

    }


    if ($("bigAvatar")) {

      $("bigAvatar").textContent =
        studentName.charAt(0).toUpperCase();

    }


    if ($("studentMeta")) {

      $("studentMeta").textContent =
        profile?.programme
          ? profile.programme +
            " · " +
            college
          : college;

    }


    /* -----------------------------------------
       GET MOOD CHECK-INS
       ----------------------------------------- */

    const moodResponse =
      await sb
        .from("mood_checkins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false
        });


    if (moodResponse.error) {

      console.error(
        "Mood loading error:",
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
        "Appointment loading error:",
        appointmentResponse.error
      );

    }


    const appointments =
      appointmentResponse.data || [];


    /* -----------------------------------------
       LATEST MOOD
       ----------------------------------------- */

    if ($("latest")) {

      $("latest").textContent =
        moods.length
          ? moods[0].mood
          : "—";

    }


    if ($("latestDate")) {

      $("latestDate").textContent =
        moods.length
          ? formatDateTime(
              moods[0].created_at
            )
          : "No check-ins yet";

    }


    /* -----------------------------------------
       CHECK-IN COUNT
       ----------------------------------------- */

    if ($("count")) {

      $("count").textContent =
        moods.length;

    }


    /* -----------------------------------------
       UPCOMING APPOINTMENT
       ----------------------------------------- */

    const now =
      new Date();


    const upcoming =
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
      upcoming[0] || null;


    /* -----------------------------------------
       SHOW UPCOMING SESSION
       ----------------------------------------- */

    if ($("next")) {

      $("next").textContent =
        nextAppointment
          ? nextAppointment.support_type
          : "—";

    }


    if ($("nextDate")) {

      $("nextDate").textContent =
        nextAppointment
          ? formatAppointment(
              nextAppointment
            )
          : "No appointment booked";

    }


    /* -----------------------------------------
       RECENT CHECK-INS
       ----------------------------------------- */

    if ($("history")) {

      if (!moods.length) {

        $("history").innerHTML =
          "<p>No check-ins yet.</p>";

      }

      else {

        /*
         Show latest 8
        */

        $("history").innerHTML =
          moods
            .slice(0, 8)
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

  }

  catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

  }

}


/* =========================================================
   REFRESH BUTTON
   ========================================================= */

if ($("refresh")) {

  $("refresh").onclick = async () => {

    const button =
      $("refresh");


    button.disabled = true;

    const oldText =
      button.textContent;


    button.textContent =
      "Refreshing…";


    try {

      await loadDashboard();

    }

    catch (error) {

      console.error(error);

    }

    finally {

      button.textContent =
        oldText || "Refresh";

      button.disabled = false;

    }

  };

}


/* =========================================================
   MOOD SELECTION
   ========================================================= */

document
  .querySelectorAll("[data-mood]")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll("[data-mood]")
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


      setText(
        "checkMsg",
        "Selected: " +
        selectedMood
      );

    };

  });


/* =========================================================
   SAVE MOOD
   ========================================================= */

if ($("checkin")) {

  $("checkin").onclick = async () => {

    if (!user) {

      authMode(true);

      return;

    }


    if (!selectedMood) {

      setText(
        "checkMsg",
        "Choose a mood first."
      );

      return;

    }


    setText(
      "checkMsg",
      "Saving…"
    );


    try {

      const response =
        await sb
          .from("mood_checkins")
          .insert({

            user_id: user.id,

            mood: selectedMood

          });


      if (response.error) {
        throw response.error;
      }


      setText(
        "checkMsg",
        "Saved privately to your account ✓"
      );


      /* Clear selected mood */

      document
        .querySelectorAll("[data-mood]")
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

      console.error(error);

      setText(
        "checkMsg",
        error.message ||
        "Could not save check-in."
      );

    }

  };

}


/* =========================================================
   OPEN BOOKING MODAL
   ========================================================= */

function openBooking() {

  if (!user) {

    authMode(true);

    return;

  }


  resetBooking();


  show("booking");

}


/* =========================================================
   BOOK BUTTON
   ========================================================= */

if ($("bookBtn")) {

  $("bookBtn").onclick = () => {

    openBooking();

  };

}


/* =========================================================
   OTHER BOOK BUTTONS
   ========================================================= */

document
  .querySelectorAll(".book")
  .forEach(button => {

    button.onclick = () => {

      openBooking();

    };

  });


/* =========================================================
   RESET BOOKING FORM
   ========================================================= */

function resetBooking() {

  const form =
    $("bookingForm");


  if (form) {

    form.reset();

  }


  /*
   Reset support type
   */

  if ($("type")) {

    $("type").selectedIndex = 0;

  }


  /*
   Clear date
   */

  if ($("date")) {

    $("date").value = "";

  }


  /*
   Clear time
   */

  if ($("time")) {

    $("time").value = "";

  }


  setText(
    "bookMsg",
    ""
  );

}


/* =========================================================
   BOOKING FORM
   ========================================================= */

if ($("bookingForm")) {

  $("bookingForm").onsubmit =
    async event => {

      event.preventDefault();


      if (!user) {

        authMode(true);

        return;

      }


      const supportType =
        $("type")?.value || "";


      const appointmentDate =
        $("date")?.value || "";


      const appointmentTime =
        $("time")?.value || "";


      /* -----------------------------------------
         VALIDATION
         ----------------------------------------- */

      if (
        !supportType ||
        !appointmentDate ||
        !appointmentTime
      ) {

        setText(
          "bookMsg",
          "Please fill in all the details."
        );

        return;

      }


      /* -----------------------------------------
         PREVENT PAST APPOINTMENTS
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

        setText(
          "bookMsg",
          "Please choose a future date and time."
        );

        return;

      }


      setText(
        "bookMsg",
        "Saving your appointment…"
      );


      try {

        /* -----------------------------------------
           INSERT INTO SUPABASE
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

        setText(
          "bookMsg",
          "Appointment booked ✓"
        );


        /*
         IMPORTANT:
         Clear the booking form immediately.
        */

        resetBooking();


        /*
         Reload dashboard directly
         from Supabase.
        */

        await loadDashboard();


        /*
         Wait briefly so user sees success.
        */

        setTimeout(() => {

          closeModals();

          show("dash");

          /*
           One final refresh after opening
           dashboard.
          */

          loadDashboard();

        }, 700);

      }


      catch (error) {

        console.error(
          "Booking error:",
          error
        );


        setText(
          "bookMsg",
          error.message ||
          "Could not book appointment."
        );

      }

    };

}


/* =========================================================
   PROFILE
   ========================================================= */

async function openProfile() {

  if (!user) {

    authMode(true);

    return;

  }


  const profile =
    await getProfile();


  if ($("pName")) {

    $("pName").value =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      "";

  }


  if ($("pRoll")) {

    $("pRoll").value =
      profile?.roll_number ||
      "";

  }


  if ($("pBatch")) {

    $("pBatch").value =
      profile?.batch ||
      "";

  }


  if ($("pProgramme")) {

    $("pProgramme").value =
      profile?.programme ||
      "";

  }


  if ($("pCollege")) {

    $("pCollege").value =
      profile?.college ||
      user.user_metadata?.college ||
      "XIME Chennai";

  }


  if ($("pPhone")) {

    $("pPhone").value =
      profile?.phone ||
      "";

  }


  setText(
    "profileMsg",
    ""
  );


  show("profile");

}


/* =========================================================
   PROFILE BUTTONS
   ========================================================= */

if ($("profileBtn")) {

  $("profileBtn").onclick = async () => {

    hide("drop");

    await openProfile();

  };

}


if ($("editProfile")) {

  $("editProfile").onclick =
    async () => {

      await openProfile();

    };

}


/* =========================================================
   SAVE PROFILE
   ========================================================= */

if ($("profileForm")) {

  $("profileForm").onsubmit =
    async event => {

      event.preventDefault();


      if (!user) {

        authMode(true);

        return;

      }


      setText(
        "profileMsg",
        "Saving…"
      );


      try {

        const profileData = {

          id: user.id,

          full_name:
            $("pName")?.value.trim() ||
            "",

          roll_number:
            $("pRoll")?.value.trim() ||
            "",

          batch:
            $("pBatch")?.value.trim() ||
            "",

          programme:
            $("pProgramme")?.value.trim() ||
            "",

          college:
            $("pCollege")?.value.trim() ||
            "",

          phone:
            $("pPhone")?.value.trim() ||
            "",

          updated_at:
            new Date().toISOString()

        };


        const response =
          await sb
            .from("profiles")
            .upsert(
              profileData,
              {
                onConflict: "id"
              }
            );


        if (response.error) {
          throw response.error;
        }


        /*
         Also update login metadata
        */

        await sb.auth.updateUser({

          data: {

            full_name:
              profileData.full_name,

            college:
              profileData.college

          }

        });


        setText(
          "profileMsg",
          "Profile saved ✓"
        );


        await loadDashboard();

        await updateUI();


        setTimeout(() => {

          closeModals();

          show("dash");

        }, 700);

      }


      catch (error) {

        console.error(
          "Profile error:",
          error
        );


        setText(
          "profileMsg",
          error.message ||
          "Could not save profile."
        );

      }

    };

}


/* =========================================================
   DASHBOARD CHECK-IN BUTTON
   ========================================================= */

if ($("dashCheckin")) {

  $("dashCheckin").onclick = () => {

    closeModals();

    const firstMood =
      document.querySelector(
        "[data-mood]"
      );


    if (firstMood) {

      firstMood.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }

  };

}


/* =========================================================
   RESOURCE BUTTONS
   ========================================================= */

function resource(title, text) {

  const toast =
    $("toast");


  if (!toast) {

    alert(
      title +
      "\n\n" +
      text
    );

    return;

  }


  toast.innerHTML =
    "<strong>" +
    escapeHTML(title) +
    "</strong><br>" +
    escapeHTML(text);


  show("toast");


  setTimeout(() => {

    hide("toast");

  }, 5000);

}


/* =========================================================
   DEMO BUTTON
   ========================================================= */

if ($("demo")) {

  $("demo").onclick = () => {

    show("demoModal");

  };

}


if ($("demoForm")) {

  $("demoForm").onsubmit =
    event => {

      event.preventDefault();


      setText(
        "demoMsg",
        "Demo request captured ✓"
      );


      event.target.reset();

    };

}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function formatDateOnly(dateString) {

  try {

    return new Date(
      dateString
    ).toLocaleDateString();

  }

  catch {

    return dateString;

  }

}


function formatDateTime(dateString) {

  try {

    return new Date(
      dateString
    ).toLocaleString();

  }

  catch {

    return dateString;

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
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    ) +
    " · " +
    date.toLocaleTimeString(
      undefined,
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
   SECURITY / HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   KEYBOARD ESCAPE
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
   START APPLICATION
   ========================================================= */

(async function startApp() {

  try {

    const response =
      await sb.auth.getSession();


    user =
      response.data.session?.user ||
      null;


    await updateUI();


    if (user) {

      /*
       Don't automatically open dashboard.
       Just make sure the data is ready.
      */

      await loadDashboard();

    }


    /*
     Listen for login/logout changes.
    */

    sb.auth.onAuthStateChange(
      async (_event, session) => {

        user =
          session?.user ||
          null;


        await updateUI();

      }
    );

  }


  catch (error) {

    console.error(
      "MindCampus startup error:",
      error
    );

  }

})();
