// =========================================================
// MINDCAMPUS — COMPLETE SCRIPT
// =========================================================


// =========================================================
// SUPABASE
// =========================================================

const SUPABASE_URL =
  "https://tfidkfvuzsfvebstbgcv.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_KToTfVS_FwufyHAn1QUzwQ_rRdYqyIx";

const ready =
  typeof supabase !== "undefined" &&
  !SUPABASE_URL.startsWith("YOUR_") &&
  !SUPABASE_ANON_KEY.startsWith("YOUR_");

const sb = ready
  ? supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    )
  : null;


// =========================================================
// VARIABLES
// =========================================================

let user = null;
let signup = false;
let mood = null;


// =========================================================
// HELPERS
// =========================================================

const $ = id => document.getElementById(id);

const show = id => {
  const element = $(id);

  if (element) {
    element.classList.remove("hidden");
  }
};

const hide = id => {
  const element = $(id);

  if (element) {
    element.classList.add("hidden");
  }
};

const closeModals = () => {
  document
    .querySelectorAll(".modal")
    .forEach(modal => {
      modal.classList.add("hidden");
    });
};


// =========================================================
// AUTH MODE
// =========================================================

function authMode(isSignup) {

  signup = isSignup;

  if ($("authEyebrow")) {
    $("authEyebrow").textContent =
      signup
        ? "START YOUR PRIVATE SPACE"
        : "WELCOME BACK";
  }

  if ($("authTitle")) {
    $("authTitle").textContent =
      signup
        ? "Create your MindCampus account"
        : "Log in to MindCampus";
  }

  document
    .querySelectorAll("#nameWrap,#collegeWrap")
    .forEach(element => {

      element.classList.toggle(
        "hidden",
        !signup
      );

    });

  if ($("authForm")) {

    const button =
      $("authForm").querySelector("button");

    if (button) {
      button.textContent =
        signup
          ? "Create account"
          : "Log in";
    }

  }

  if ($("switch")) {
    $("switch").textContent =
      signup
        ? "Already have an account? Log in"
        : "New here? Create an account";
  }

  if ($("authMsg")) {
    $("authMsg").textContent = "";
  }

  show("auth");
}


// =========================================================
// LOGIN / SIGNUP BUTTONS
// =========================================================

$("loginBtn")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    authMode(false);

  }
);


$("signupBtn")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    authMode(true);

  }
);


$("heroSignup")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    authMode(true);

  }
);


$("heroLogin")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    authMode(false);

  }
);


$("cta")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    authMode(true);

  }
);


$("switch")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    authMode(!signup);

  }
);


// =========================================================
// CLOSE MODALS
// =========================================================

document
  .querySelectorAll("[data-close]")
  .forEach(button => {

    button.addEventListener(
      "click",
      closeModals
    );

  });


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


// =========================================================
// AUTH FORM
// =========================================================

$("authForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    if (!sb) {

      if ($("authMsg")) {
        $("authMsg").textContent =
          "Supabase is not connected.";
      }

      return;
    }

    if ($("authMsg")) {
      $("authMsg").textContent =
        "Please wait…";
    }

    try {

      // ---------------------------------------------------
      // SIGN UP
      // ---------------------------------------------------

      if (signup) {

        const name =
          $("name")?.value.trim() || "";

        const college =
          $("college")?.value.trim() || "";

        const email =
          $("email")?.value.trim() || "";

        const password =
          $("password")?.value || "";


        if (!email || !password) {

          $("authMsg").textContent =
            "Please enter your email and password.";

          return;
        }


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


        // Email confirmation required

        if (!result.data.session) {

          $("authMsg").textContent =
            "Account created. Check your email, then log in.";

          return;

        }

      }


      // ---------------------------------------------------
      // LOGIN
      // ---------------------------------------------------

      else {

        const email =
          $("email")?.value.trim() || "";

        const password =
          $("password")?.value || "";


        if (!email || !password) {

          $("authMsg").textContent =
            "Please enter your email and password.";

          return;
        }


        const result =
          await sb.auth.signInWithPassword({

            email: email,

            password: password

          });


        if (result.error) {
          throw result.error;
        }

      }


      // ---------------------------------------------------
      // GET SESSION
      // ---------------------------------------------------

      const sessionResult =
        await sb.auth.getSession();


      user =
        sessionResult.data.session?.user ||
        null;


      closeModals();

      await ui();


      // ---------------------------------------------------
      // OPEN DASHBOARD AFTER LOGIN
      // ---------------------------------------------------

      if (user) {
        await dash();
      }

    }

    catch (error) {

      if ($("authMsg")) {

        $("authMsg").textContent =
          error.message ||
          "Something went wrong.";

      }

    }

  }
);


// =========================================================
// UI STATE
// =========================================================

async function ui() {

  // =======================================================
  // LOGGED OUT
  // =======================================================

  if (!user) {

    show("loginBtn");
    show("signupBtn");

    show("heroSignup");
    show("cta");
    show("heroLogin");

    hide("userMenu");

    return;
  }


  // =======================================================
  // LOGGED IN
  // =======================================================

  hide("loginBtn");
  hide("signupBtn");

  hide("heroSignup");
  hide("cta");
  hide("heroLogin");

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


// =========================================================
// USER AVATAR
// =========================================================

$("avatar")?.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    $("drop")?.classList.toggle(
      "hidden"
    );

  }
);


// =========================================================
// CLOSE DROPDOWN WHEN CLICKING OUTSIDE
// =========================================================

document.addEventListener(
  "click",
  event => {

    const drop =
      $("drop");

    const avatar =
      $("avatar");


    if (
      drop &&
      avatar &&
      !drop.contains(event.target) &&
      !avatar.contains(event.target)
    ) {

      drop.classList.add(
        "hidden"
      );

    }

  }
);


// =========================================================
// DASHBOARD FROM PROFILE
// =========================================================

$("dashboardBtn")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    hide("drop");

    dash();

  }
);


// =========================================================
// LOGOUT
// =========================================================

$("logoutBtn")?.addEventListener(
  "click",
  async event => {

    event.preventDefault();

    if (sb) {

      await sb.auth.signOut();

    }

    user = null;

    mood = null;

    closeModals();

    await ui();

  }
);


// =========================================================
// MOOD SELECTION
// =========================================================

document
  .querySelectorAll("[data-mood]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

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


        mood =
          button.dataset.mood;


        if ($("checkMsg")) {

          $("checkMsg").textContent =
            "Selected: " + mood;

        }

      }
    );

  });


// =========================================================
// SAVE MOOD CHECK-IN
// =========================================================

$("checkin")?.addEventListener(
  "click",
  async event => {

    event.preventDefault();

    if (!user) {

      authMode(true);

      return;
    }


    if (!mood) {

      $("checkMsg").textContent =
        "Choose a mood first.";

      return;
    }


    if (!sb) {

      $("checkMsg").textContent =
        "Supabase is not connected.";

      return;
    }


    const result =
      await sb
        .from("mood_checkins")
        .insert({

          user_id:
            user.id,

          mood:
            mood

        });


    if (result.error) {

      $("checkMsg").textContent =
        result.error.message;

      return;
    }


    $("checkMsg").textContent =
      "Saved privately to your account ✓";


    await loadDash();

  }
);


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

$("refresh")?.addEventListener(
  "click",
  async event => {

    event.preventDefault();

    await loadDash();

  }
);


// =========================================================
// LOAD DASHBOARD
// =========================================================

async function loadDash() {

  if (!sb || !user) {
    return;
  }


  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student";


  // -------------------------------------------------------
  // WELCOME
  // -------------------------------------------------------

  if ($("welcome")) {

    $("welcome").textContent =
      "Welcome back, " +
      name.split(" ")[0] +
      " 👋";

  }


  // -------------------------------------------------------
  // MOODS
  // -------------------------------------------------------

  const moodResult =
    await sb
      .from("mood_checkins")
      .select("*")
      .eq(
        "user_id",
        user.id
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(8);


  // -------------------------------------------------------
  // APPOINTMENTS
  // -------------------------------------------------------

  const appointmentResult =
    await sb
      .from("appointments")
      .select("*")
      .eq(
        "user_id",
        user.id
      )
      .order(
        "appointment_date",
        {
          ascending: true
        }
      );


  const moods =
    moodResult.data || [];


  const appointments =
    appointmentResult.data || [];


  // -------------------------------------------------------
  // LATEST CHECK-IN
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
  // NEXT APPOINTMENT
  // -------------------------------------------------------

  const now =
    new Date();


  const nextAppointment =
    appointments.find(
      appointment => {

        const appointmentDate =
          new Date(
            appointment.appointment_date +
            "T" +
            appointment.appointment_time
          );


        return appointmentDate >= now;

      }
    );


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
  // HISTORY
  // -------------------------------------------------------

  if ($("history")) {

    if (moods.length) {

      $("history").innerHTML =
        moods
          .map(item => {

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

          })
          .join("");

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


// =========================================================
// DASHBOARD BOOKING BUTTON
// =========================================================

$("bookBtn")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();


    if (!user) {

      authMode(true);

      return;

    }


    openBooking();

  }
);


// =========================================================
// SUPPORT BOOKING BUTTONS
// =========================================================

document
  .querySelectorAll(".book")
  .forEach(button => {

    button.addEventListener(
      "click",
      event => {

        event.preventDefault();


        if (!user) {

          authMode(true);

          return;

        }


        openBooking();

      }
    );

  });


// =========================================================
// BOOKING FORM
// =========================================================

$("bookingForm")?.addEventListener(
  "submit",
  async event => {

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

          user_id:
            user.id,

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


    $("bookingForm").reset();


    setTimeout(
      async () => {

        closeModals();

        await dash();

      },
      700
    );

  }
);


// =========================================================
// INSTITUTION DEMO
// =========================================================

$("demo")?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    show("demoModal");

  }
);


$("demoForm")?.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    $("demoMsg").textContent =
      "Demo request captured ✓";


    event.target.reset();

  }
);


// =========================================================
// SAVED CONTACTS
// =========================================================

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
      .eq(
        "user_id",
        user.id
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (result.error) {

    box.innerHTML =
      "<p>Unable to load saved contacts.</p>";

    return;

  }


  const contacts =
    result.data || [];


  // -------------------------------------------------------
  // NO CONTACTS
  // -------------------------------------------------------

  if (!contacts.length) {

    box.innerHTML =
      "<p>No saved contacts yet.</p>";

    return;

  }


  // -------------------------------------------------------
  // DISPLAY CONTACTS
  // NO CALLING FEATURE
  // -------------------------------------------------------

  box.innerHTML =
    contacts
      .map(contact => {

        return `
          <div class="contact-card">

            <div>

              <strong>
                ${escapeHtml(
                  contact.name
                )}
              </strong>

              <span>
                ${escapeHtml(
                  contact.relationship ||
                  "Contact"
                )}

                ·

                ${escapeHtml(
                  contact.phone
                )}
              </span>

              <small>
                ✓ Saved
              </small>

            </div>


            <div>

              <button
                class="btn ghost delete-contact"
                data-id="${contact.id}"
              >
                Remove
              </button>

            </div>

          </div>
        `;

      })
      .join("");


  // -------------------------------------------------------
  // REMOVE CONTACT
  // -------------------------------------------------------

  document
    .querySelectorAll(".delete-contact")
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const id =
            button.dataset.id;


          const result =
            await sb
              .from("saved_contacts")
              .delete()
              .eq(
                "id",
                id
              )
              .eq(
                "user_id",
                user.id
              );


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

        }
      );

    });

}


// =========================================================
// ADD PEER CONTACT
// =========================================================

$("contactForm")?.addEventListener(
  "submit",
  async event => {

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
      $("contactName")
        .value
        .trim();


    const relationship =
      $("contactRelation")
        .value;


    const phone =
      $("contactPhone")
        .value
        .trim();


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

          user_id:
            user.id,

          name:
            name,

          relationship:
            relationship,

          phone:
            phone

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

  }
);


// =========================================================
// STUDENT PROBLEM / SUPPORT REQUEST
// =========================================================

$("problemForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    if (!user) {

      authMode(false);

      return;

    }


    if (!sb) {

      $("problemMsg").textContent =
        "Supabase is not connected.";

      return;

    }


    const problem =
      $("problemText")
        ?.value
        .trim() || "";


    if (!problem) {

      $("problemMsg").textContent =
        "Please describe your problem.";

      return;

    }


    $("problemMsg").textContent =
      "Submitting privately...";


    const result =
      await sb
        .from("student_problems")
        .insert({

          user_id:
            user.id,

          problem:
            problem

        });


    if (result.error) {

      $("problemMsg").textContent =
        result.error.message;

      return;

    }


    $("problemMsg").textContent =
      "✓ Your response has been submitted privately. Our team will get back to you.";


    $("problemForm").reset();

  }
);


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


// =========================================================
// INITIALIZE
// =========================================================

(async function initialize() {

  try {

    if (sb) {

      const sessionResult =
        await sb.auth.getSession();


      user =
        sessionResult
          .data
          .session?.user ||
        null;


      // -----------------------------------------------------
      // AUTH STATE CHANGES
      // -----------------------------------------------------

      sb.auth.onAuthStateChange(
        async (_event, session) => {

          user =
            session?.user ||
            null;


          await ui();


          // If user logs in,
          // open dashboard immediately

          if (
            user &&
            _event === "SIGNED_IN"
          ) {

            await dash();

          }

        }
      );

    }


    await ui();


    // -------------------------------------------------------
    // IF USER IS ALREADY LOGGED IN AFTER REFRESH
    // OPEN DASHBOARD AUTOMATICALLY
    // -------------------------------------------------------

    if (user) {

      await dash();

    }

  }

  catch (error) {

    console.error(
      "MindCampus initialization error:",
      error
    );

  }

})();
