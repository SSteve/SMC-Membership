function getCycles() {
  // If the current date is within a cycle, assume that's the cycle you care about.
  // If the current date is between cycles, assume you care about the upcoming cycle.
  // This function will return an array of objects, starting with the cycle before
  // the one you "care" about, the one you care about, plus the following three cycles.
  // The output should have 5 cycle objects in all.
  // This code assumes that the spring cycle runs from Feb (2) through May (5), and
  // the fall cycle runs from Sep (9) through Dec (12).

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const cycles = [];

  if (inRange(currentMonth, 1, 5)) {
    currentCycle = { season: "Spring", year: currentYear };
  } else if (inRange(currentMonth, 6, 12)) {
    currentCycle = { season: "Fall", year: currentYear };
  }

  // Now add the previous cycle:
  if (currentCycle.season === "Fall") {
    cycles.push({ season: "Spring", year: currentYear });
  } else {
    cycles.push({ season: "Fall", year: currentYear - 1 });
  }
  cycles.push(currentCycle);

  // Now add the three next cycles:
  if ((currentCycle.season = "Fall")) {
    cycles.push({ season: "Spring", year: currentYear + 1 });
    cycles.push({ season: "Fall", year: currentYear + 1 });
    cycles.push({ season: "Spring", year: currentYear + 2 });
  } else {
    // currentSeason.cycle must be "Spring" if it ain't Fall.
    cycles.push({ season: "Fall", year: currentYear });
    cycles.push({ season: "Spring", year: currentYear + 1 });
    cycles.push({ season: "Fall", year: currentYear + 1 });
  }
  return cycles;
}

function test() {
  let cycles = getCycles();
  Logger.log(cycles);
}

function inRange(x, min, max) {
  return (x - min) * (x - max) <= 0;
}
