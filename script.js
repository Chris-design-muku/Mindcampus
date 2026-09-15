const SUPABASE_URL = "https://tfidkfvuzsfvebstbgcv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KToTfVS_FwufyHAn1QUzwQ_rRdYqyIx";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let user = null;
let signup = false;
let mood = null;

const $ = (id) => document.getElementById(id);

const show = (id) => {
  const el = $(id);
  if (el) el.classList.remove("hidden");
};

const hide = (id) => {
  const el = $(id);
  if (el) el.classList.add("hidden");
};

const close = () => {
  document.querySelectorAll(".modal").forEach((x) => {
    x.classList.add("hidden");
  });
};


/* =========================
   AUTH MODE
========================= */

function authMode(isSignup) {
  signup = isSignup;

  $("authEyebrow").textContent = signup
    ? "START YOUR PRIVATE SPACE"
    : "WELCOME BACK";

  $("authTitle").textContent = signup
    ? "Create your MindCampus account"
    : "Log in to MindCampus";

  document
    .querySelectorAll("#nameWrap,#collegeWrap")
    .forEach((x) => x.classList.toggle("hidden", !signup));

  $("authForm").querySelector("button").textContent = signup
    ? "Create account"
    : "Log in";

  $("switch").textContent = signup
    ? "Already have an account? Log in"
    : "New here? Create an account";

  $("authMsg").textContent = "";

  show("auth");
}


/* =========================
   BUTTONS
========================= */

$("loginBtn").onclick = () => authMode(false);

$("signupBtn").onclick = () => authMode(true);

$("heroSignup").onclick = () => authMode(true);

$("heroLogin").onclick = () => authMode(false);

$("cta").onclick = () => authMode(true);

$("switch").onclick = () => authMode(!signup);

document.querySelectorAll("[data-close]").forEach((x) => {
  x.onclick = close;
});

document.querySelectorAll(".modal").forEach((x) => {
  x.onclick = (e) => {
    if (e.target === x) close();
  };
});


/* =========================
   SIGN UP / LOGIN
========================= */

$("authForm").onsubmit = async (e) => {
  e.preventDefault();

  $("authMsg").textContent = "Please wait…";

  try {
    if (signup) {

      const name = $("name").value.trim();
      const college = $("college").value.trim();
      const email = $("email").value.trim();
      const password = $("password").value;

      const result = await supabaseClient.auth.signUp({
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

      if (!result.data.session) {
        $("authMsg").textContent =
          "Account created. Please check your email and confirm your account before logging in.";

        return;
      }

    } else {

      const email = $("email").value.trim();
      const password = $("password").value;

      const result = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (result.error) {
        throw result.error;
      }
    }

    const sessionResult = await supabaseClient.auth.getSession();

    user = sessionResult.data.session
      ? sessionResult.data.session.user
      : null;

    close();
    updateUI();

    if (user) {
      await dash();
    }

  } catch (error) {

    console.error("MindCampus authentication error:", error);

    $("authMsg").textContent =
      error.message || "Something went wrong. Please try again.";
  }
};


/* =========================
   USER UI
========================= */

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

  $("userLabel").textContent = name;
}


/* =========================
   USER MENU
========================= */

$("avatar").onclick = () => {
  $("drop").classList.toggle("hidden");
};

$("logoutBtn").onclick = async () => {

  await supabaseClient.auth.signOut();

  user = null;

  updateUI();

  close();
};

$("dashboardBtn").onclick = () => {

  hide("drop");

  dash();
};


/* =========================
   MOOD CHECK-IN
========================= */

document.querySelectorAll("[data-mood]").forEach((button) => {

  button.onclick = () => {

    document
      .querySelectorAll("[data-mood]")
      .forEach((x) => x.classList.remove("selected"));

    button.classList.add("selected");

    mood = button.dataset.mood;

    $("checkMsg").textContent =
      "Selected: " + mood;
  };
});


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

  try {

    const result = await supabaseClient
      .from("mood_checkins")
      .insert({
        user_id: user.id,
        mood: mood
      });

    if (result.error) {
      throw result.error;
    }

    $("checkMsg").textContent =
      "Saved privately to your account ✓";

    await loadDash();

  } catch (error) {

    console.error("Mood check-in error:", error);

    $("checkMsg").textContent =
      error.message || "Unable to save your check-in.";
  }
};


/* =========================
   DASHBOARD
========================= */

async function dash() {

  if (!user) {
    authMode(false);
    return;
  }

  show("dash");

  await loadDash();
}


$("refresh").onclick = loadDash;


async function loadDash() {

  if (!user) return;

  try {

    const name =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Student";

    $("welcome").textContent =
      "Welcome back, " +
      name.split(" ")[0] +
      " 👋";


    /* Mood history */

    const moodResult = await supabaseClient
      .from("mood_checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false
      })
      .limit(8);


    if (moodResult.error) {
      throw moodResult.error;
    }


    /* Appointments */

    const appointmentResult = await supabaseClient
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("appointment_date", {
        ascending: true
      });


    if (appointmentResult.error) {
      throw appointmentResult.error;
    }


    const moods = moodResult.data || [];
    const appointments =
      appointmentResult.data || [];


    $("latest").textContent =
      moods[0]?.mood || "—";


    $("latestDate").textContent =
      moods[0]
        ? new Date(moods[0].created_at).toLocaleString()
        : "No check-ins yet";


    const now = new Date();

    const nextAppointment =
      appointments.find((appointment) => {

        const appointmentDate =
          new Date(
            appointment.appointment_date +
            "T" +
            appointment.appointment_time
          );

        return appointmentDate >= now;
      });


    $("next").textContent =
      nextAppointment?.support_type || "—";


    $("nextDate").textContent =
      nextAppointment
        ? nextAppointment.appointment_date +
          " · " +
          nextAppointment.appointment_time
        : "No appointment booked";


    $("history").innerHTML =
      moods.length

        ? moods
            .map(
              (item) =>
                `<p>
                  ${item.mood}
                  <span style="float:right">
                    ${new Date(
                      item.created_at
                    ).toLocaleDateString()}
                  </span>
                </p>`
            )
            .join("")

        : "<p>No check-ins yet.</p>";

  } catch (error) {

    console.error("Dashboard error:", error);

  }
}


/* =========================
   APPOINTMENTS
========================= */

$("bookBtn").onclick = () => {

  close();

  show("booking");
};


document.querySelectorAll(".book").forEach((button) => {

  button.onclick = () => {

    if (user) {
      show("booking");
    } else {
      authMode(true);
    }
  };
});


$("bookingForm").onsubmit = async (e) => {

  e.preventDefault();

  if (!user) {
    authMode(false);
    return;
  }

  try {

    const result = await supabaseClient
      .from("appointments")
      .insert({
        user_id: user.id,
        support_type: $("type").value,
        appointment_date: $("date").value,
        appointment_time: $("time").value,
        status: "requested"
      });


    if (result.error) {
      throw result.error;
    }


    $("bookMsg").textContent =
      "Appointment saved ✓";


    setTimeout(() => {

      close();

      dash();

    }, 700);


  } catch (error) {

    console.error("Appointment error:", error);

    $("bookMsg").textContent =
      error.message ||
      "Unable to save appointment.";
  }
};


/* =========================
   INSTITUTION DEMO
========================= */

$("demo").onclick = () => {

  show("demoModal");
};


$("demoForm").onsubmit = (e) => {

  e.preventDefault();

  $("demoMsg").textContent =
    "Demo request captured ✓";

  e.target.reset();
};


/* =========================
   STARTUP
========================= */

(async () => {

  try {

    const sessionResult =
      await supabaseClient.auth.getSession();

    user =
      sessionResult.data.session
        ? sessionResult.data.session.user
        : null;


    supabaseClient.auth.onAuthStateChange(
      (_event, session) => {

        user =
          session
            ? session.user
            : null;

        updateUI();
      }
    );


    updateUI();


  } catch (error) {

    console.error(
      "MindCampus startup error:",
      error
    );
  }

})();
