/* =========================================================
   MINDCAMPUS — SCRIPT.JS
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
   BASIC HELPERS
   ========================================================= */

const $ = id => document.getElementById(id);

const show = id => {
  const el = $(id);
  if (el) el.classList.remove("hidden");
};

const hide = id => {
  const el = $(id);
  if (el) el.classList.add("hidden");
};

const close = () => {
  document.querySelectorAll(".modal").forEach(modal => {
    modal.classList.add("hidden");
  });
};


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let user = null;
let signup = false;
let mood = null;


/* =========================================================
   AUTH MODE
   ========================================================= */

function authMode(isSignup) {

  signup = isSignup;

  $("authEyebrow").textContent =
    signup
      ? "START YOUR PRIVATE SPACE"
      : "WELCOME BACK";

  $("authTitle").textContent =
    signup
      ? "Create your MindCampus account"
      : "Log in to MindCampus";

  document
    .querySelectorAll("#nameWrap,#collegeWrap")
    .forEach(element => {
      element.classList.toggle("hidden", !signup);
    });

  $("authForm").querySelector("button").textContent =
    signup
      ? "Create account"
      : "Log in";

  $("switch").textContent =
    signup
      ? "Already have an account? Log in"
      : "New here? Create an account";

  $("authMsg").textContent = "";

  show("auth");
}


/* =========================================================
   AUTH BUTTONS
   ========================================================= */

$("loginBtn").onclick = () => {
  authMode(false);
};

$("signupBtn").onclick = () => {
  authMode(true);
};

$("heroSignup").onclick = () => {
  authMode(true);
};

$("heroLogin").onclick = () => {
  authMode(false);
};

$("cta").onclick = () => {
  authMode(true);
};

$("switch").onclick = () => {
  authMode(!signup);
};


/* =========================================================
   MODAL CLOSE
   ========================================================= */

document.querySelectorAll("[data-close]").forEach(button => {

  button.onclick = close;

});


document.querySelectorAll(".modal").forEach(modal => {

  modal.onclick = event => {

    if (event.target === modal) {
      close();
    }

  };

});


/* =========================================================
   SIGN UP / LOGIN
   ========================================================= */

$("authForm").onsubmit = async event => {

  event.preventDefault();

  $("authMsg").textContent = "Please wait…";

  try {

    /* -------------------------
       SIGN UP
       ------------------------- */

    if (signup) {

      const fullName =
        $("name").value.trim();

      const college =
        $("college").value.trim();

      const email =
        $("email").value.trim();

      const password =
        $("password").value;


      const response =
        await sb.auth.signUp({

          email: email,

          password: password,

          options: {

            data: {

              full_name: fullName,

              college: college

            }

          }

        });


      if (response.error) {
        throw response.error;
      }


      /*
       Supabase may require email confirmation.
      */

      if (!response.data.session) {

        $("authMsg").textContent =
          "Account created. Check your email, then log in.";

        return;

      }

    }


    /* -------------------------
       LOGIN
       ------------------------- */

    else {

      const email =
        $("email").value.trim();

      const password =
        $("password").value;


      const response =
        await sb.auth.signInWithPassword({

          email: email,

          password: password

        });


      if (response.error) {
        throw response.error;
      }

    }


    close();


    const sessionResponse =
      await sb.auth.getSession();

    user =
      sessionResponse.data.session?.user || null;


    await updateUI();

    await loadDash();


  } catch (error) {

    console.error(error);

    $("authMsg").textContent =
      error.message ||
      "Something went wrong.";

  }

};


/* =========================================================
   USER UI
   ========================================================= */

async function updateUI() {

  if (!user) {

    hide("userMenu");

    show("loginBtn");
    show("signupBtn");

    return;

  }


  hide("loginBtn");
  hide("signupBtn");

  show("userMenu");


  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student";


  $("avatar").textContent =
    name.charAt(0).toUpperCase();

  $("userLabel").textContent =
    name;

}


/* =========================================================
   USER DROPDOWN
   ========================================================= */

$("avatar").onclick = () => {

  $("drop").classList.toggle("hidden");

};


$("logoutBtn").onclick = async () => {

  await sb.auth.signOut();

  user = null;

  close();

  hide("drop");

  await updateUI();

};


/* =========================================================
   DASHBOARD BUTTON
   ========================================================= */

$("dashboardBtn").onclick = async () => {

  hide("drop");

  await dash();

};


/* =========================================================
   GET STUDENT PROFILE
   ========================================================= */

async function getProfile() {

  if (!user) return null;


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


/* =========================================================
   OPEN DASHBOARD
   ========================================================= */

async function dash() {

  if (!user) {

    authMode(false);

    return;

  }


  show("dash");

  await loadDash();

}


/* =========================================================
   LOAD DASHBOARD
   ========================================================= */

async function loadDash() {

  if (!sb || !user) return;


  try {

    /* =====================================================
       PROFILE
       ===================================================== */

    const profile =
      await getProfile();


    const name =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Student";


    const college =
      profile?.college ||
      user.user_metadata?.college ||
      "XIME Chennai";


    const roll =
      profile?.roll_number ||
      "Roll number not added";


    $("welcome").textContent =
      "Welcome back, " +
      name.split(" ")[0] +
      " 👋";


    if ($("studentMeta")) {

      $("studentMeta").textContent =
        profile?.programme
          ? profile.programme +
            " · " +
            college
          : college;

    }


    if ($("dashName")) {

      $("dashName").textContent =
        name;

    }


    if ($("dashCollege")) {

      $("dashCollege").textContent =
        college;

    }


    if ($("dashRoll")) {

      $("dashRoll").textContent =
        roll;

    }


    if ($("bigAvatar")) {

      $("bigAvatar").textContent =
        name.charAt(0).toUpperCase();

    }


    /* =====================================================
       MOOD CHECK-INS
       ===================================================== */

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


    /* =====================================================
       APPOINTMENTS
       ===================================================== */

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


    /* =====================================================
       LATEST MOOD
       ===================================================== */

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


    /* =====================================================
       CHECK-IN COUNT
       ===================================================== */

    if ($("count")) {

      $("count").textContent =
        moods.length;

    }


    /* =====================================================
       FIND NEXT APPOINTMENT
       ===================================================== */

    const now = new Date();


    const futureAppointments =
      appointments.filter(appointment => {

        if (
          !appointment.appointment_date ||
          !appointment.appointment_time
        ) {

          return false;

        }


        const dateTime =
          new Date(
            appointment.appointment_date +
            "T" +
            appointment.appointment_time
          );


        return dateTime >= now;

      });


    const next =
      futureAppointments[0];


    if ($("next")) {

      $("next").textContent =
        next?.support_type || "—";

    }


    if ($("nextDate")) {

      $("nextDate").textContent =
        next
          ? formatAppointmentDate(next)
          : "No appointment booked";

    }


    /* =====================================================
       MOOD HISTORY
       ===================================================== */

    if ($("history")) {

      if (!moods.length) {

        $("history").innerHTML =
          "<p>No check-ins yet.</p>";

      } else {

        $("history").innerHTML =
          moods
            .map(item => {

              const date =
                new Date(
                  item.created_at
                ).toLocaleDateString();

              return `
                <p>
                  ${escapeHTML(item.mood)}
                  <span style="float:right">
                    ${date}
                  </span>
                </p>
              `;

            })
            .join("");

      }

    }


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

  }

}


/* =========================================================
   FORMAT APPOINTMENT DATE
   ========================================================= */

function formatAppointmentDate(appointment) {

  const date =
    new Date(
      appointment.appointment_date +
      "T" +
      appointment.appointment_time
    );


  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric"
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


/* =========================================================
   REFRESH BUTTON
   ========================================================= */

$("refresh").onclick = async () => {

  const button = $("refresh");


  button.textContent =
    "Refreshing…";

  button.disabled = true;


  try {

    await loadDash();

  } finally {

    button.textContent =
      "Refresh";

    button.disabled = false;

  }

};


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


      button.classList.add("selected");


      mood =
        button.dataset.mood;


      $("checkMsg").textContent =
        "Selected: " + mood;

    };

  });


/* =========================================================
   SAVE MOOD CHECK-IN
   ========================================================= */

$("checkin").onclick = async () => {

  if (!user) {

    authMode(true);

    return;

  }


  if (!mood) {

    $("checkMsg").textContent =
      "Choose a mood first.";

    return;

  }


  $("checkMsg").textContent =
    "Saving…";


  const response =
    await sb
      .from("mood_checkins")
      .insert({

        user_id: user.id,

        mood: mood

      });


  if (response.error) {

    console.error(
      response.error
    );

    $("checkMsg").textContent =
      response.error.message;

    return;

  }


  $("checkMsg").textContent =
    "Saved privately to your account ✓";


  /* Clear selected mood */

  document
    .querySelectorAll("[data-mood]")
    .forEach(button => {

      button.classList.remove(
        "selected"
      );

    });


  mood = null;


  /* Update dashboard */

  await loadDash();

};


/* =========================================================
   OPEN PROFILE
   ========================================================= */

$("profileBtn").onclick = async () => {

  hide("drop");

  await openProfile();

};


$("editProfile").onclick = async () => {

  await openProfile();

};


async function openProfile() {

  if (!user) {

    authMode(true);

    return;

  }


  const profile =
    await getProfile();


  const fallbackName =
    user.user_metadata?.full_name || "";


  const fallbackCollege =
    user.user_metadata?.college ||
    "XIME Chennai";


  $("pName").value =
    profile?.full_name ||
    fallbackName;


  $("pRoll").value =
    profile?.roll_number ||
    "";


  $("pBatch").value =
    profile?.batch ||
    "";


  $("pProgramme").value =
    profile?.programme ||
    "";


  $("pCollege").value =
    profile?.college ||
    fallbackCollege;


  $("pPhone").value =
    profile?.phone ||
    "";


  $("profileMsg").textContent = "";


  show("profile");

}


/* =========================================================
   SAVE PROFILE
   ========================================================= */

$("profileForm").onsubmit = async event => {

  event.preventDefault();


  if (!user) {

    authMode(true);

    return;

  }


  $("profileMsg").textContent =
    "Saving…";


  const profileData = {

    id: user.id,

    full_name:
      $("pName").value.trim(),

    roll_number:
      $("pRoll").value.trim(),

    batch:
      $("pBatch").value.trim(),

    programme:
      $("pProgramme").value.trim(),

    college:
      $("pCollege").value.trim(),

    phone:
      $("pPhone").value.trim(),

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

    console.error(
      response.error
    );

    $("profileMsg").textContent =
      response.error.message;

    return;

  }


  $("profileMsg").textContent =
    "Profile saved ✓";


  /* Update user metadata too */

  await sb.auth.updateUser({

    data: {

      full_name:
        $("pName").value.trim(),

      college:
        $("pCollege").value.trim()

    }

  });


  /* Reload current user */

  const sessionResponse =
    await sb.auth.getSession();

  user =
    sessionResponse.data.session?.user ||
    user;


  await updateUI();

  await loadDash();


  setTimeout(() => {

    close();

  }, 700);

};


/* =========================================================
   BOOKING — OPEN BUTTON
   ========================================================= */

$("bookBtn").onclick = () => {

  if (!user) {

    authMode(true);

    return;

  }


  resetBookingForm();

  show("booking");

};


/* =========================================================
   ALL SUPPORT / BOOK BUTTONS
   ========================================================= */

document
  .querySelectorAll(".book")
  .forEach(button => {

    button.onclick = () => {

      if (!user) {

        authMode(true);

        return;

      }


      resetBookingForm();

      show("booking");

    };

  });


/* =========================================================
   RESET BOOKING FORM
   ========================================================= */

function resetBookingForm() {

  const form =
    $("bookingForm");


  if (form) {

    form.reset();

  }


  $("bookMsg").textContent = "";


  /*
   Explicitly reset support type
   to the first option.
  */

  const type =
    $("type");

  if (type && type.options.length) {

    type.selectedIndex = 0;

  }

}


/* =========================================================
   BOOK APPOINTMENT
   ========================================================= */

$("bookingForm").onsubmit = async event => {

  event.preventDefault();


  if (!user) {

    authMode(true);

    return;

  }


  const supportType =
    $("type").value;


  const appointmentDate =
    $("date").value;


  const appointmentTime =
    $("time").value;


  if (
    !supportType ||
    !appointmentDate ||
    !appointmentTime
  ) {

    $("bookMsg").textContent =
      "Please fill in all the details.";

    return;

  }


  /* Prevent past dates/times */

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


  $("bookMsg").textContent =
    "Saving your appointment…";


  const response =
    await sb
      .from("appointments")
      .insert({

        user_id: user.id,

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

    console.error(
      response.error
    );

    $("bookMsg").textContent =
      response.error.message;

    return;

  }


  /* SUCCESS */

  $("bookMsg").textContent =
    "Appointment requested ✓";


  /*
   IMPORTANT:
   Clear the form immediately.
  */

  resetBookingForm();


  /*
   Pull the new appointment
   from Supabase.
  */

  await loadDash();


  /*
   Close booking modal.
  */

  setTimeout(() => {

    close();

    show("dash");

  }, 800);

};


/* =========================================================
   DASHBOARD CHECK-IN BUTTON
   ========================================================= */

if ($("dashCheckin")) {

  $("dashCheckin").onclick = () => {

    close();

    document
      .querySelector("[data-mood]")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

  };

}


/* =========================================================
   RESOURCES
   ========================================================= */

function resource(title, text) {

  $("toast").innerHTML =
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
   DEMO REQUEST
   ========================================================= */

$("demo").onclick = () => {

  show("demoModal");

};


$("demoForm").onsubmit = event => {

  event.preventDefault();


  $("demoMsg").textContent =
    "Demo request captured ✓";


  event.target.reset();

};


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  if (value === null || value === undefined) {
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
   AUTH SESSION ON PAGE LOAD
   ========================================================= */

(async () => {

  try {

    const response =
      await sb.auth.getSession();


    user =
      response.data.session?.user ||
      null;


    await updateUI();


    if (user) {

      await loadDash();

    }


    sb.auth.onAuthStateChange(
      async (_event, session) => {

        user =
          session?.user ||
          null;


        await updateUI();

      }
    );


  } catch (error) {

    console.error(
      "Startup error:",
      error
    );

  }

})();
