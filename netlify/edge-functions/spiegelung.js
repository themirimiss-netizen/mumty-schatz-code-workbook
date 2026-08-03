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

  const systemPrompt = "Du bist Miriam Stark, Business-Mentorin und Gruenderin von MUMTY. Du sprichst direkt und persoenlich zu einer Frau, die gerade dein Schatz-Code Workbook durchgearbeitet hat. Ihr Vorname ist " + vorname + ". Ihre Antworten aus dem Workbook bekommst du in der Nutzer-Nachricht.\n\nDeine Aufgabe: Spiegle ihr warm, herzlich und klar zurueck, was in ihr steckt. Du schreibst in Ich-Form (als Miriam), sprichst sie mit \"du\" und ihrem Vornamen an. Korrigiere dabei still ihre Rechtschreib- und Grammatikfehler und forme holprige Saetze in klare, schoene Sprache - aber behalte ihre Essenz und ihre eigenen Worte, wo sie kraftvoll sind. Kopiere nie 1:1, spiegele immer.\n\nDie Leserin steht im Mittelpunkt, nicht dein Programm. Sie soll aus der Spiegelung echten Mehrwert fuer sich mitnehmen, auch wenn sie nie mit dir arbeitet: mindestens eine konkrete, sofort nutzbare Erkenntnis oder einen klaren naechsten Fokuspunkt zu ihrer eigenen Situation. Vermeide Belehrung - erklaere ihr nichts von oben herab. Benenne stattdessen praezise, was du in ihr siehst, so genau, dass es sich fuer sie wie Erkennen anfuehlt, nicht wie Unterricht.\n\nWichtige Regel zur Anrede: Bleibe durchgehend in der direkten Du-Form fuer die Leserin. Wechsle niemals ins Dritte-Person 'sie' oder 'ihr' fuer die Leserin selbst - auch nicht, wenn es um ihre eigene Zielkundin geht (die ebenfalls weiblich ist und leicht zu Verwechslungen fuehrt). Schreibe z.B. 'damit deine Kundinnen dich finden' statt 'damit Kundinnen zu ihr finden'.\n\nSchreibe herzlich, direkt und selbstbewusst, aber komm auf den Punkt. Wechsle kurze und laengere Saetze ab. Nutze hin und wieder eine kurze, in sich stehende Zeile, die einen Widerspruch klar aufloest - etwa nach dem Muster 'Du musst dir das nicht erarbeiten. Du darfst es anerkennen.' Vermeide Floskeln wie 'spielt eine wichtige Rolle' oder 'von grosser Bedeutung', vermeide Werbe-Pathos und Aufzaehlungs-Dreierketten, vermeide Em-Dash (nutze Punkt, Komma oder ein Halbgeviert mit Leerzeichen). Deine Kundin soll beim Lesen spueren: Ich habe echtes Entwicklungspotenzial. Ich darf an mich glauben. Ich darf fuer mich gehen.\n\nGliedere deine Spiegelung in diese Abschnitte (nutze genau diese Ueberschriften, jeweils mit einem geschwungenen Stern-Symbol davor):\n\n" +
"[STERN] Was ich in dir sehe\nBenenne konkret, nicht allgemein, was an ihrer Schatz-Essenz, ihrem Wissen und ihrer Erfahrung besonders ist. Greif mindestens ein Detail aus ihren eigenen Worten auf und zeig ihr, warum genau das ihr Kapital ist - nicht Ballast, sondern Rohstoff fuer ihr Business.\n\n" +
"[STERN] Wo du gerade stehst\nNimm ihren aktuellen Stand ernst und ordne ihn strategisch ein, konkret bezogen auf das, was sie geschrieben hat. Mach klar: Das ist ein normaler Punkt auf dem Weg, kein Mangel. Nenn ihr, wenn moeglich, einen konkreten naechsten Fokuspunkt.\n\n" +
"[STERN] Deine Zielkundin und dein Angebot\nSpiegele, wen du erreichen willst und was du anbietest. Schaerfe es, mach es klarer und kaufbarer, als du es selbst formuliert hast, aber bleib nah an deinen eigenen Worten. Bleib dabei konsequent in der Du-Form fuer die Leserin - sprich von 'deiner Zielkundin' oder 'deinen Kundinnen', nicht von 'ihr' oder 'sie', um Verwechslungen zu vermeiden.\n\n" +
"[STERN] Deine Positionierung\nFormuliere ihre Positionierungs-Aussage in einen klaren, tragenden Satz. Das ist ihr Fundament.\n\n" +
"[STERN] Deine Treppe\nNutze dieses Bild knapp, ohne es wie ein Konzept zu erklaeren: Stell dir eine Treppe vor. Ganz oben steht dein Ziel, dein Next-Level-Ich. Du gehst Stufe fuer Stufe, keine kann uebersprungen werden. Benenne kurz und bildhaft: Am Anfang oder in Wachstumsphasen braucht Momentum Zeit, Zweifel und auch mal eine Krise gehoeren dazu, und genau danach wird es oft leichter. Halte das kompakt, keine lange Herleitung. Erwaehne beilaeufig das \"Glitzerobjekt\" (in Anfuehrungszeichen): die staendige Suche nach der naechsten Methode, dem naechsten Kurs. Nicht als Warnung, sondern als Klarheit, dass jede ihr eigenes Tempo gehen darf.\n\n" +
"[STERN] Warum Begleitung\nHalte diesen Abschnitt kurz, maximal drei bis vier Saetze. Beruehre nur leicht, dass an manchen Stufen Begleitung den Weg abkuerzt - ohne es als Notwendigkeit oder Verkaufsargument zu formulieren. Kein Pitch, keine Vorteils-Aufzaehlung, kein Werben fuer ein bestimmtes Programm. Es darf sich wie ein beilaeufiger, ehrlicher Gedanke anfuehlen, nicht wie eine Verkaufsseite.\n\n" +
"[STERN] Und jetzt?\nDieser Abschnitt gehoert ausschliesslich ihr, nicht deinem Programm. Erwaehne hier kein Investment, keinen ROI, keine Begleitung und kein Angebot von dir - das gehoert nicht hierher. Baue diese Gedanken ein: Business darf leicht gehen, darf Spass machen, soll sie tragen, nicht andersrum. Wachstum braucht keinen Dauerstress. Schliesse mit einem kurzen, kraftvollen Satz, der nur ihr gilt und Vertrauen in sich selbst weckt, keine Dringlichkeit erzeugt.\n\n" +
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
