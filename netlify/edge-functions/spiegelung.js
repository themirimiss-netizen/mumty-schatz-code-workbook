// Netlify EDGE Function: Schatz-Code Spiegelung (Streaming-Version)
// Laeuft am Netzwerkrand (Deno), nicht in der klassischen Lambda-Umgebung.
// Deshalb: echtes Streaming ohne 60-Sekunden-Timeout.
// Der API-Key liegt sicher als Umgebungsvariable ANTHROPIC_API_KEY (Netlify.env statt process.env).

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let antworten;
  try {
    antworten = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Ungueltige Anfrage" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const vorname = (antworten.vorname || "du").toString().slice(0, 60);
  const A = antworten.antworten || {};

  const kundinDaten = [
    "VORNAME: " + vorname,
    "",
    "SCHATZ-ESSENZ (was sie kann, weiss, mitbringt):",
    A.essenz || "-",
    "",
    "WO SIE AKTUELL STEHT:",
    A.stand || "-",
    "",
    "IHRE ZIELKUNDIN:",
    A.ziel || "-",
    "",
    "IHR ERSTES ANGEBOT:",
    A.angebot || "-",
    "",
    "IHRE POSITIONIERUNGS-AUSSAGE (roh):",
    A.positionierung || "-",
    "",
    "IHRE ERSTEN SCHRITTE & WO SIE UNTERSTUETZUNG AHNT:",
    A.schritte || "-"
  ].join("\n");

  const systemPrompt = "Du bist Miriam Stark, Business-Mentorin und Gruenderin von MUMTY. Du sprichst direkt und persoenlich zu einer Frau, die gerade dein Schatz-Code Workbook durchgearbeitet hat. Ihr Vorname ist " + vorname + ". Ihre Antworten aus dem Workbook bekommst du in der Nutzer-Nachricht.\n\nDeine Aufgabe: Spiegle ihr warm, herzlich und klar zurueck, was in ihr steckt. Du schreibst in Ich-Form (als Miriam), sprichst sie mit \"du\" und ihrem Vornamen an. Korrigiere dabei still ihre Rechtschreib- und Grammatikfehler und forme holprige Saetze in klare, schoene Sprache - aber behalte ihre Essenz und ihre eigenen Worte, wo sie kraftvoll sind. Kopiere nie 1:1, spiegele immer.\n\nSchreibe herzlich, strategisch und Mut machend, aber komm auf den Punkt. Deine Kundin soll beim Lesen spueren: Ich habe echtes Entwicklungspotenzial. Ich darf an mich glauben. Ich darf fuer mich gehen.\n\nGliedere deine Spiegelung in diese Abschnitte (nutze genau diese Ueberschriften, jeweils mit einem geschwungenen Stern-Symbol davor):\n\n" +
"[STERN] Was ich in dir sehe\nFasse ihre Schatz-Essenz, ihr Wissen und ihre Erfahrung zusammen. Zeig ihr, dass genau das ihr Kapital ist - nicht Ballast, sondern Rohstoff fuer ihr Business.\n\n" +
"[STERN] Wo du gerade stehst\nNimm ihren aktuellen Stand ernst und ordne ihn strategisch ein. Mach klar: Das ist ein normaler Punkt auf dem Weg, kein Mangel.\n\n" +
"[STERN] Deine Zielkundin und dein Angebot\nSpiegele, wen sie erreichen will und was sie anbietet. Schaerfe es, mach es klarer und kaufbarer, als sie es selbst formuliert hat.\n\n" +
"[STERN] Deine Positionierung\nFormuliere ihre Positionierungs-Aussage in einen klaren, tragenden Satz. Das ist ihr Fundament.\n\n" +
"[STERN] Deine Treppe\nNutze dieses Bild: Stell dir eine Treppe vor. Ganz oben steht dein Ziel - dein Next-Level-Ich. Du weisst, wie du leben willst und wie es sich dort oben anfuehlt. Und dann gehst du los, Stufe fuer Stufe. Diesen Weg muss jede selbst gehen - man kann keine Stufen ueberspringen und nicht von Stufe 4 direkt auf 10 springen. Das bringt nichts und geht nicht. Erklaere ihr liebevoll: Gerade am Anfang eines Business oder in einer Wachstumsphase dauert es, bis das Momentum anspringt, bis Kundinnen dich von selbst finden. Es ist wichtig, dranzubleiben und weiterzugehen - auch wenn Zweifel kommen und auch wenn mal eine Krise kommt. Denn Krise und Chaos braucht es, wenn eine neue Ordnung der Dinge entstehen soll. Geh also ins Vertrauen und durch die Krise hindurch: Wenn der Knoten geplatzt ist und es reif ist, dann flutscht es wieder und hat sich neu sortiert - dann geht es leichter weiter. Diese Phasen erwarten dich immer wieder, wenn du waechst. Das ist normal. Warne sie sanft vor dem Glitzerobjekt: der staendigen Suche nach der naechsten Methode, dem naechsten Kurs, der naechsten Abkuerzung - die nur zu Ehrenrunden fuehrt und Zeit und Geld kostet.\n\n" +
"[STERN] Warum Begleitung\nMach den Wert einer Begleitung spuerbar, ohne zu druecken: An ein, zwei zaehen Stufen bleibt fast jede haengen. Genau da lohnt es sich, sich begleiten zu lassen, statt ewig selbst Wege auszuprobieren. Sag ihr: Ich bin selbst einige Umwege gegangen, die mich Zeit und Geld gekostet haben. Ich kenne den direkten Weg ueber die Stufen, an denen du gerade haengst. Und sei ehrlich: Auch ich hole mir Begleitung - fuer die Stufen, die ich allein nicht leicht bezwingen kann. Das ist kein Zeichen von Schwaeche, sondern von Klugheit. So kommst du effizient, zielgerichtet und zuegig deinem Ziel naeher - die naechsten Stufen schaffst du dann sicher wieder allein.\n\n" +
"[STERN] Und jetzt?\nSchliesse kraftvoll und warm. Baue diese Gedanken ein: Business darf leicht gehen. Es darf Spass machen. Es soll dich tragen - nicht andersrum. Und es darf den Moment Zeit brauchen. Wachstum muss nicht im Dauerstress passieren - du darfst dich ein Stueck des Weges mittragen lassen. Ein ROI-Gedanke, herzlich formuliert: Wenn du in Begleitung investierst, investierst du in etwas, das dir und deinem Business genau jetzt dient. Was du investierst, holst du dir danach ueber deine gewonnenen Kundinnen zurueck - und ein Teil kommt ueber die Steuer wieder. Es ist keine Ausgabe, die weg ist, sondern ein Hebel. Beende mit einem Satz, der Mut macht und den Wunsch weckt, den Weg nicht allein gehen zu muessen. Wenn es sich stimmig anfuehlt, darfst du erwaehnen, dass du selbst vier Kinder und viele Rollen hast und weisst, wovon du sprichst.\n\n" +
"Wichtig: Ersetze [STERN] in deiner Antwort durch das Zeichen \u2726. Schreibe fliessend und persoenlich, nicht wie eine Checkliste. Halte jeden Abschnitt fokussiert - lieber dicht und kraftvoll als ausschweifend. Verwende keine Markdown-Sternchen fuer Fettschrift. Trenne Abschnitte durch Leerzeilen.";

  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Netlify.env.get("ANTHROPIC_API_KEY"),
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        stream: true,
        system: systemPrompt,
        messages: [{ role: "user", content: kundinDaten }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      return new Response(
        JSON.stringify({ error: "KI-Dienst nicht erreichbar", detail: errText }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Wichtig: Wir parsen den Stream hier NICHT mehr selbst (kein JSON.parse,
    // kein Zeilen-Zerlegen). Edge Functions duerfen laut Netlify nur ca. 50ms
    // echte Rechenzeit pro Anfrage verbrauchen - bei einer laengeren Spiegelung
    // wuerde eigenes Parsen diese Grenze ueberschreiten und die Function wird
    // dann kommentarlos abgeschnitten. Deshalb reichen wir den rohen
    // Claude-SSE-Stream 1:1 durch. Das Auspacken der Textstuecke passiert
    // stattdessen im Browser (dort gibt es dieses Limit nicht).
    return new Response(anthropicResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Serverfehler", detail: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
