const dailyVerseElement = document.getElementById("dailyVerse");

fetch("https://labs.bible.org/api/?passage=random&type=json")
  .then(res => res.json())
  .then(data => {
    const verse = data[0];
    dailyVerseElement.innerText =
      `${verse.bookname} ${verse.chapter}:${verse.verse} - "${verse.text}"`;
  })
  .catch(() => {
    dailyVerseElement.innerText = "Unable to load verse.";
  });
