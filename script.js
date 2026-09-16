// =========================================================
// STUDENT PROBLEM / SUPPORT REQUEST
// =========================================================

$("problemForm")?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    if (!user) {
      authMode(true);
      return;
    }

    if (!sb) {
      $("problemMsg").textContent =
        "Supabase is not connected.";
      return;
    }

    const problem =
      $("problemText").value.trim();

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
          user_id: user.id,
          problem: problem
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
