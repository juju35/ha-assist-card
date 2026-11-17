/*
 * Assist Card for Home Assistant
 * https://github.com/juju35/ha-assist-card
 *
 * Lovelace cards to chat with a Home Assistant Assist pipeline or any conversation agent (the built-in Assist,
 * Google Generative AI, OpenAI, Anthropic, Ollama…) from a dashboard. Requests go through the
 * `assist_pipeline/run` websocket subscription (streamed answers, voice input, spoken answers), or
 * `conversation/process` when an agent is given; the conversation id is kept for follow-ups while the card lives.
 */

const VERSION = "__VERSION__";

const STRINGS = {
  en: {
    status_ready: "Ready",
    status_thinking: "Thinking…",
    status_listening: "Listening…",
    status_transcribing: "Transcribing…",
    status_speaking: "Speaking…",
    status_error: "Error",
    status_unavailable: "Unavailable",
    default_title: "Assist",
    preferred: "Preferred pipeline",
    placeholder: "Ask Assist…",
    placeholder_area: "Ask about {area}…",
    send: "Send",
    mic_start: "Speak",
    mic_stop: "Stop listening",
    new_chat: "New conversation",
    empty_title: "How can I help?",
    empty_hint: "Type a request or pick a suggestion.",
    empty_hint_voice: "Type or say a request.",
    tools_used: "Tools used",
    area_prefix: "In the {area}: {text}",
    sugg_lights_on: "Turn on the lights in the {area}",
    sugg_lights_off: "Turn off the lights in the {area}",
    sugg_temperature: "What is the temperature in the {area}?",
    sugg_open: "Is a window open in the {area}?",
    err_generic: "Something went wrong: {message}",
    err_no_speech: "I didn't catch that, please try again.",
    err_mic: "Microphone not available: {message}",
    err_timeout: "No answer from Home Assistant.",
    err_pipeline: "Assist pipeline not found: {id}",
    err_empty: "(no answer)",
    pipeline: "Assist pipeline",
    pipeline_helper: "Pipeline used for the conversation, the voice input and the spoken answers (the preferred one by default)",
    agent_id: "Conversation agent (optional)",
    agent_helper: "Talks to this agent directly instead of the pipeline's one (answers are not streamed)",
    title: "Title (optional)",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    area: "Area (optional)",
    area_helper: "Suggestions for this area, and the area given as context to AI agents",
    area_context: "Give the area as context",
    show_suggestions: "Show suggestions",
    voice: "Voice input (microphone)",
    speak: "Read the answers aloud",
    height: "Chat height",
    language: "Language",
    lang_auto: "Automatic",
    illustration: "Animated illustration",
    illustration_theme: "Illustration theme",
    theme_auto: "Automatic (sun or dark theme)",
    theme_day: "Day",
    theme_night: "Night",
    zoom: "Detail button",
    zoom_helper: "Button at the top right that switches the mini card to the full chat and back",
    zoom_in: "Show the full chat",
    zoom_out: "Show the compact card",
  },
  fr: {
    status_ready: "Prêt",
    status_thinking: "Réflexion…",
    status_listening: "À l'écoute…",
    status_transcribing: "Transcription…",
    status_speaking: "Lecture…",
    status_error: "Erreur",
    status_unavailable: "Indisponible",
    default_title: "Assist",
    preferred: "Pipeline préféré",
    placeholder: "Demandez à Assist…",
    placeholder_area: "Une question sur {area}…",
    send: "Envoyer",
    mic_start: "Parler",
    mic_stop: "Arrêter l'écoute",
    new_chat: "Nouvelle conversation",
    empty_title: "Comment puis-je vous aider ?",
    empty_hint: "Écrivez une demande ou choisissez une suggestion.",
    empty_hint_voice: "Écrivez ou dites une demande.",
    tools_used: "Outils utilisés",
    area_prefix: "Dans {area} : {text}",
    sugg_lights_on: "Allume les lumières dans {area}",
    sugg_lights_off: "Éteins les lumières dans {area}",
    sugg_temperature: "Quelle est la température dans {area} ?",
    sugg_open: "Une fenêtre est-elle ouverte dans {area} ?",
    err_generic: "Une erreur s'est produite : {message}",
    err_no_speech: "Je n'ai pas compris, veuillez réessayer.",
    err_mic: "Micro indisponible : {message}",
    err_timeout: "Pas de réponse de Home Assistant.",
    err_pipeline: "Pipeline Assist introuvable : {id}",
    err_empty: "(aucune réponse)",
    pipeline: "Pipeline Assist",
    pipeline_helper: "Pipeline utilisé pour la conversation, la saisie vocale et les réponses lues (le préféré par défaut)",
    agent_id: "Agent de conversation (facultatif)",
    agent_helper: "Parle directement à cet agent au lieu de celui du pipeline (réponses non diffusées en continu)",
    title: "Titre (facultatif)",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    area: "Pièce (facultatif)",
    area_helper: "Suggestions pour cette pièce, et la pièce donnée en contexte aux agents IA",
    area_context: "Donner la pièce en contexte",
    show_suggestions: "Afficher les suggestions",
    voice: "Saisie vocale (micro)",
    speak: "Lire les réponses à voix haute",
    height: "Hauteur de la conversation",
    language: "Langue",
    lang_auto: "Automatique",
    illustration: "Illustration animée",
    illustration_theme: "Thème de l’illustration",
    theme_auto: "Automatique (soleil ou thème sombre)",
    theme_day: "Jour",
    theme_night: "Nuit",
    zoom: "Bouton détail",
    zoom_helper: "Bouton en haut à droite qui bascule la mini-carte vers la conversation complète et inversement",
    zoom_in: "Afficher la conversation complète",
    zoom_out: "Afficher la carte compacte",
  },
  de: {
    status_ready: "Bereit",
    status_thinking: "Denkt nach…",
    status_listening: "Hört zu…",
    status_transcribing: "Transkribiert…",
    status_speaking: "Spricht…",
    status_error: "Fehler",
    status_unavailable: "Nicht verfügbar",
    default_title: "Assist",
    preferred: "Bevorzugte Pipeline",
    placeholder: "Assist fragen…",
    placeholder_area: "Frage zu {area}…",
    send: "Senden",
    mic_start: "Sprechen",
    mic_stop: "Zuhören beenden",
    new_chat: "Neues Gespräch",
    empty_title: "Wie kann ich helfen?",
    empty_hint: "Schreibe eine Anfrage oder wähle einen Vorschlag.",
    empty_hint_voice: "Schreibe oder sprich eine Anfrage.",
    tools_used: "Verwendete Werkzeuge",
    area_prefix: "Im Bereich {area}: {text}",
    sugg_lights_on: "Schalte das Licht in {area} ein",
    sugg_lights_off: "Schalte das Licht in {area} aus",
    sugg_temperature: "Wie warm ist es in {area}?",
    sugg_open: "Ist in {area} ein Fenster offen?",
    err_generic: "Etwas ist schiefgelaufen: {message}",
    err_no_speech: "Ich habe das nicht verstanden, bitte versuche es noch einmal.",
    err_mic: "Mikrofon nicht verfügbar: {message}",
    err_timeout: "Keine Antwort von Home Assistant.",
    err_pipeline: "Assist-Pipeline nicht gefunden: {id}",
    err_empty: "(keine Antwort)",
    pipeline: "Assist-Pipeline",
    pipeline_helper: "Pipeline für das Gespräch, die Spracheingabe und die gesprochenen Antworten (standardmäßig die bevorzugte)",
    agent_id: "Gesprächsagent (optional)",
    agent_helper: "Spricht direkt mit diesem Agenten statt mit dem der Pipeline (Antworten werden nicht gestreamt)",
    title: "Titel (optional)",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    area: "Bereich (optional)",
    area_helper: "Vorschläge für diesen Bereich, und der Bereich als Kontext für KI-Agenten",
    area_context: "Bereich als Kontext mitgeben",
    show_suggestions: "Vorschläge anzeigen",
    voice: "Spracheingabe (Mikrofon)",
    speak: "Antworten vorlesen",
    height: "Höhe des Gesprächs",
    language: "Sprache",
    lang_auto: "Automatisch",
    illustration: "Animierte Illustration",
    illustration_theme: "Thema der Illustration",
    theme_auto: "Automatisch (Sonne oder dunkles Design)",
    theme_day: "Tag",
    theme_night: "Nacht",
    zoom: "Detailschaltfläche",
    zoom_helper: "Schaltfläche oben rechts, die die Mini-Karte zum vollständigen Gespräch umschaltet und zurück",
    zoom_in: "Vollständiges Gespräch anzeigen",
    zoom_out: "Kompakte Karte anzeigen",
  },
  es: {
    status_ready: "Listo",
    status_thinking: "Pensando…",
    status_listening: "Escuchando…",
    status_transcribing: "Transcribiendo…",
    status_speaking: "Hablando…",
    status_error: "Error",
    status_unavailable: "No disponible",
    default_title: "Assist",
    preferred: "Canalización preferida",
    placeholder: "Pregunta a Assist…",
    placeholder_area: "Pregunta sobre {area}…",
    send: "Enviar",
    mic_start: "Hablar",
    mic_stop: "Dejar de escuchar",
    new_chat: "Nueva conversación",
    empty_title: "¿En qué puedo ayudarte?",
    empty_hint: "Escribe una petición o elige una sugerencia.",
    empty_hint_voice: "Escribe o di una petición.",
    tools_used: "Herramientas usadas",
    area_prefix: "En {area}: {text}",
    sugg_lights_on: "Enciende las luces de {area}",
    sugg_lights_off: "Apaga las luces de {area}",
    sugg_temperature: "¿Qué temperatura hace en {area}?",
    sugg_open: "¿Hay alguna ventana abierta en {area}?",
    err_generic: "Algo salió mal: {message}",
    err_no_speech: "No te he entendido, inténtalo de nuevo.",
    err_mic: "Micrófono no disponible: {message}",
    err_timeout: "Sin respuesta de Home Assistant.",
    err_pipeline: "Canalización de Assist no encontrada: {id}",
    err_empty: "(sin respuesta)",
    pipeline: "Canalización de Assist",
    pipeline_helper: "Canalización usada para la conversación, la entrada por voz y las respuestas habladas (la preferida por defecto)",
    agent_id: "Agente de conversación (opcional)",
    agent_helper: "Habla directamente con este agente en lugar del de la canalización (respuestas sin transmisión progresiva)",
    title: "Título (opcional)",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    area: "Área (opcional)",
    area_helper: "Sugerencias para esta área, y el área dada como contexto a los agentes de IA",
    area_context: "Dar el área como contexto",
    show_suggestions: "Mostrar sugerencias",
    voice: "Entrada por voz (micrófono)",
    speak: "Leer las respuestas en voz alta",
    height: "Altura de la conversación",
    language: "Idioma",
    lang_auto: "Automático",
    illustration: "Ilustración animada",
    illustration_theme: "Tema de la ilustración",
    theme_auto: "Automático (sol o tema oscuro)",
    theme_day: "Día",
    theme_night: "Noche",
    zoom: "Botón de detalle",
    zoom_helper: "Botón arriba a la derecha que cambia la minitarjeta a la conversación completa y viceversa",
    zoom_in: "Mostrar la conversación completa",
    zoom_out: "Mostrar la tarjeta compacta",
  },
  it: {
    status_ready: "Pronto",
    status_thinking: "Sto pensando…",
    status_listening: "In ascolto…",
    status_transcribing: "Trascrizione…",
    status_speaking: "Sto parlando…",
    status_error: "Errore",
    status_unavailable: "Non disponibile",
    default_title: "Assist",
    preferred: "Pipeline preferita",
    placeholder: "Chiedi ad Assist…",
    placeholder_area: "Chiedi su {area}…",
    send: "Invia",
    mic_start: "Parla",
    mic_stop: "Interrompi l'ascolto",
    new_chat: "Nuova conversazione",
    empty_title: "Come posso aiutarti?",
    empty_hint: "Scrivi una richiesta o scegli un suggerimento.",
    empty_hint_voice: "Scrivi o pronuncia una richiesta.",
    tools_used: "Strumenti usati",
    area_prefix: "In {area}: {text}",
    sugg_lights_on: "Accendi le luci in {area}",
    sugg_lights_off: "Spegni le luci in {area}",
    sugg_temperature: "Che temperatura c'è in {area}?",
    sugg_open: "C'è una finestra aperta in {area}?",
    err_generic: "Qualcosa è andato storto: {message}",
    err_no_speech: "Non ho capito, riprova.",
    err_mic: "Microfono non disponibile: {message}",
    err_timeout: "Nessuna risposta da Home Assistant.",
    err_pipeline: "Pipeline di Assist non trovata: {id}",
    err_empty: "(nessuna risposta)",
    pipeline: "Pipeline di Assist",
    pipeline_helper: "Pipeline usata per la conversazione, l'input vocale e le risposte lette (quella preferita per impostazione predefinita)",
    agent_id: "Agente di conversazione (facoltativo)",
    agent_helper: "Parla direttamente con questo agente invece che con quello della pipeline (risposte non in streaming)",
    title: "Titolo (facoltativo)",
    show_title: "Mostra titolo",
    show_subtitle: "Mostra sottotitolo",
    area: "Area (facoltativa)",
    area_helper: "Suggerimenti per quest'area, e l'area data come contesto agli agenti IA",
    area_context: "Dai l'area come contesto",
    show_suggestions: "Mostra suggerimenti",
    voice: "Input vocale (microfono)",
    speak: "Leggi ad alta voce le risposte",
    height: "Altezza della conversazione",
    language: "Lingua",
    lang_auto: "Automatica",
    illustration: "Illustrazione animata",
    illustration_theme: "Tema dell’illustrazione",
    theme_auto: "Automatico (sole o tema scuro)",
    theme_day: "Giorno",
    theme_night: "Notte",
    zoom: "Pulsante dettagli",
    zoom_helper: "Pulsante in alto a destra che passa dalla mini scheda alla conversazione completa e viceversa",
    zoom_in: "Mostra la conversazione completa",
    zoom_out: "Mostra la scheda compatta",
  },
  nl: {
    status_ready: "Gereed",
    status_thinking: "Denkt na…",
    status_listening: "Luistert…",
    status_transcribing: "Transcriberen…",
    status_speaking: "Spreekt…",
    status_error: "Fout",
    status_unavailable: "Niet beschikbaar",
    default_title: "Assist",
    preferred: "Voorkeurspipeline",
    placeholder: "Vraag het Assist…",
    placeholder_area: "Vraag over {area}…",
    send: "Versturen",
    mic_start: "Spreken",
    mic_stop: "Stoppen met luisteren",
    new_chat: "Nieuw gesprek",
    empty_title: "Waarmee kan ik helpen?",
    empty_hint: "Typ een verzoek of kies een suggestie.",
    empty_hint_voice: "Typ of zeg een verzoek.",
    tools_used: "Gebruikte hulpmiddelen",
    area_prefix: "In {area}: {text}",
    sugg_lights_on: "Zet de lampen in {area} aan",
    sugg_lights_off: "Zet de lampen in {area} uit",
    sugg_temperature: "Wat is de temperatuur in {area}?",
    sugg_open: "Staat er een raam open in {area}?",
    err_generic: "Er ging iets mis: {message}",
    err_no_speech: "Dat heb ik niet verstaan, probeer het opnieuw.",
    err_mic: "Microfoon niet beschikbaar: {message}",
    err_timeout: "Geen antwoord van Home Assistant.",
    err_pipeline: "Assist-pipeline niet gevonden: {id}",
    err_empty: "(geen antwoord)",
    pipeline: "Assist-pipeline",
    pipeline_helper: "Pipeline voor het gesprek, de spraakinvoer en de uitgesproken antwoorden (standaard de voorkeurspipeline)",
    agent_id: "Gespreksagent (optioneel)",
    agent_helper: "Praat rechtstreeks met deze agent in plaats van die van de pipeline (antwoorden worden niet gestreamd)",
    title: "Titel (optioneel)",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    area: "Ruimte (optioneel)",
    area_helper: "Suggesties voor deze ruimte, en de ruimte als context voor AI-agents",
    area_context: "Ruimte als context meegeven",
    show_suggestions: "Suggesties tonen",
    voice: "Spraakinvoer (microfoon)",
    speak: "Antwoorden voorlezen",
    height: "Hoogte van het gesprek",
    language: "Taal",
    lang_auto: "Automatisch",
    illustration: "Geanimeerde illustratie",
    illustration_theme: "Thema van de illustratie",
    theme_auto: "Automatisch (zon of donker thema)",
    theme_day: "Dag",
    theme_night: "Nacht",
    zoom: "Detailknop",
    zoom_helper: "Knop rechtsboven die de minikaart omschakelt naar het volledige gesprek en terug",
    zoom_in: "Volledig gesprek tonen",
    zoom_out: "Compacte kaart tonen",
  },
  pt: {
    status_ready: "Pronto",
    status_thinking: "A pensar…",
    status_listening: "A ouvir…",
    status_transcribing: "A transcrever…",
    status_speaking: "A falar…",
    status_error: "Erro",
    status_unavailable: "Indisponível",
    default_title: "Assist",
    preferred: "Pipeline preferido",
    placeholder: "Pergunte ao Assist…",
    placeholder_area: "Pergunte sobre {area}…",
    send: "Enviar",
    mic_start: "Falar",
    mic_stop: "Parar de ouvir",
    new_chat: "Nova conversa",
    empty_title: "Como posso ajudar?",
    empty_hint: "Escreva um pedido ou escolha uma sugestão.",
    empty_hint_voice: "Escreva ou diga um pedido.",
    tools_used: "Ferramentas usadas",
    area_prefix: "Na divisão {area}: {text}",
    sugg_lights_on: "Acende as luzes da {area}",
    sugg_lights_off: "Apaga as luzes da {area}",
    sugg_temperature: "Qual é a temperatura na {area}?",
    sugg_open: "Há alguma janela aberta na {area}?",
    err_generic: "Algo correu mal: {message}",
    err_no_speech: "Não percebi, tente novamente.",
    err_mic: "Microfone indisponível: {message}",
    err_timeout: "Sem resposta do Home Assistant.",
    err_pipeline: "Pipeline do Assist não encontrado: {id}",
    err_empty: "(sem resposta)",
    pipeline: "Pipeline do Assist",
    pipeline_helper: "Pipeline usado para a conversa, a entrada por voz e as respostas faladas (o preferido por predefinição)",
    agent_id: "Agente de conversa (opcional)",
    agent_helper: "Fala diretamente com este agente em vez do agente do pipeline (respostas sem transmissão contínua)",
    title: "Título (opcional)",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    area: "Divisão (opcional)",
    area_helper: "Sugestões para esta divisão, e a divisão dada como contexto aos agentes de IA",
    area_context: "Dar a divisão como contexto",
    show_suggestions: "Mostrar sugestões",
    voice: "Entrada por voz (microfone)",
    speak: "Ler as respostas em voz alta",
    height: "Altura da conversa",
    language: "Idioma",
    lang_auto: "Automático",
    illustration: "Ilustração animada",
    illustration_theme: "Tema da ilustração",
    theme_auto: "Automático (sol ou tema escuro)",
    theme_day: "Dia",
    theme_night: "Noite",
    zoom: "Botão de detalhe",
    zoom_helper: "Botão no canto superior direito que alterna o minicartão para a conversa completa e vice-versa",
    zoom_in: "Mostrar a conversa completa",
    zoom_out: "Mostrar o cartão compacto",
  },
  pl: {
    status_ready: "Gotowy",
    status_thinking: "Myślę…",
    status_listening: "Słucham…",
    status_transcribing: "Transkrypcja…",
    status_speaking: "Mówię…",
    status_error: "Błąd",
    status_unavailable: "Niedostępny",
    default_title: "Assist",
    preferred: "Preferowany potok",
    placeholder: "Zapytaj Assist…",
    placeholder_area: "Zapytaj o: {area}…",
    send: "Wyślij",
    mic_start: "Mów",
    mic_stop: "Zatrzymaj słuchanie",
    new_chat: "Nowa rozmowa",
    empty_title: "W czym mogę pomóc?",
    empty_hint: "Wpisz polecenie lub wybierz sugestię.",
    empty_hint_voice: "Wpisz lub powiedz polecenie.",
    tools_used: "Użyte narzędzia",
    area_prefix: "W pomieszczeniu {area}: {text}",
    sugg_lights_on: "Włącz światła w {area}",
    sugg_lights_off: "Wyłącz światła w {area}",
    sugg_temperature: "Jaka jest temperatura w {area}?",
    sugg_open: "Czy w {area} jest otwarte okno?",
    err_generic: "Coś poszło nie tak: {message}",
    err_no_speech: "Nie zrozumiałem, spróbuj ponownie.",
    err_mic: "Mikrofon niedostępny: {message}",
    err_timeout: "Brak odpowiedzi od Home Assistant.",
    err_pipeline: "Nie znaleziono potoku Assist: {id}",
    err_empty: "(brak odpowiedzi)",
    pipeline: "Potok Assist",
    pipeline_helper: "Potok używany do rozmowy, wprowadzania głosowego i odpowiedzi czytanych na głos (domyślnie preferowany)",
    agent_id: "Agent konwersacji (opcjonalnie)",
    agent_helper: "Rozmawia bezpośrednio z tym agentem zamiast z agentem potoku (odpowiedzi nie są przesyłane strumieniowo)",
    title: "Tytuł (opcjonalnie)",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    area: "Obszar (opcjonalnie)",
    area_helper: "Sugestie dla tego obszaru oraz obszar przekazywany jako kontekst agentom AI",
    area_context: "Przekaż obszar jako kontekst",
    show_suggestions: "Pokaż sugestie",
    voice: "Wprowadzanie głosowe (mikrofon)",
    speak: "Czytaj odpowiedzi na głos",
    height: "Wysokość rozmowy",
    language: "Język",
    lang_auto: "Automatycznie",
    illustration: "Animowana ilustracja",
    illustration_theme: "Motyw ilustracji",
    theme_auto: "Automatycznie (słońce lub ciemny motyw)",
    theme_day: "Dzień",
    theme_night: "Noc",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przycisk w prawym górnym rogu przełączający mini kartę na pełną rozmowę i z powrotem",
    zoom_in: "Pokaż pełną rozmowę",
    zoom_out: "Pokaż kompaktową kartę",
  },
  sr: {
    status_ready: "Спреман",
    status_thinking: "Размишљам…",
    status_listening: "Слушам…",
    status_transcribing: "Транскрибујем…",
    status_speaking: "Говорим…",
    status_error: "Грешка",
    status_unavailable: "Недоступно",
    default_title: "Assist",
    preferred: "Пожељни ток",
    placeholder: "Питајте Assist…",
    placeholder_area: "Питање о: {area}…",
    send: "Пошаљи",
    mic_start: "Говори",
    mic_stop: "Заустави слушање",
    new_chat: "Нови разговор",
    empty_title: "Како могу да помогнем?",
    empty_hint: "Упишите захтев или изаберите предлог.",
    empty_hint_voice: "Упишите или изговорите захтев.",
    tools_used: "Коришћени алати",
    area_prefix: "У простору {area}: {text}",
    sugg_lights_on: "Укључи светла у {area}",
    sugg_lights_off: "Искључи светла у {area}",
    sugg_temperature: "Колика је температура у {area}?",
    sugg_open: "Да ли је отворен прозор у {area}?",
    err_generic: "Дошло је до грешке: {message}",
    err_no_speech: "Нисам разумео, покушајте поново.",
    err_mic: "Микрофон није доступан: {message}",
    err_timeout: "Нема одговора од Home Assistant-а.",
    err_pipeline: "Assist ток није пронађен: {id}",
    err_empty: "(нема одговора)",
    pipeline: "Assist ток",
    pipeline_helper: "Ток за разговор, гласовни унос и изговорене одговоре (подразумевано пожељни)",
    agent_id: "Агент за разговор (опционо)",
    agent_helper: "Разговара директно са овим агентом уместо са агентом тока (одговори се не стримују)",
    title: "Наслов (опционо)",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    area: "Простор (опционо)",
    area_helper: "Предлози за овај простор, и простор дат као контекст AI агентима",
    area_context: "Дај простор као контекст",
    show_suggestions: "Прикажи предлоге",
    voice: "Гласовни унос (микрофон)",
    speak: "Читај одговоре наглас",
    height: "Висина разговора",
    language: "Језик",
    lang_auto: "Аутоматски",
    illustration: "Анимирана илустрација",
    illustration_theme: "Тема илустрације",
    theme_auto: "Аутоматски (сунце или тамна тема)",
    theme_day: "Дан",
    theme_night: "Ноћ",
    zoom: "Дугме за детаље",
    zoom_helper: "Дугме горе десно које пребацује мини картицу на цео разговор и назад",
    zoom_in: "Прикажи цео разговор",
    zoom_out: "Прикажи компактну картицу",
  },
  "sr-Latn": {
    status_ready: "Spreman",
    status_thinking: "Razmišljam…",
    status_listening: "Slušam…",
    status_transcribing: "Transkribujem…",
    status_speaking: "Govorim…",
    status_error: "Greška",
    status_unavailable: "Nedostupno",
    default_title: "Assist",
    preferred: "Poželjni tok",
    placeholder: "Pitajte Assist…",
    placeholder_area: "Pitanje o: {area}…",
    send: "Pošalji",
    mic_start: "Govori",
    mic_stop: "Zaustavi slušanje",
    new_chat: "Novi razgovor",
    empty_title: "Kako mogu da pomognem?",
    empty_hint: "Upišite zahtev ili izaberite predlog.",
    empty_hint_voice: "Upišite ili izgovorite zahtev.",
    tools_used: "Korišćeni alati",
    area_prefix: "U prostoru {area}: {text}",
    sugg_lights_on: "Uključi svetla u {area}",
    sugg_lights_off: "Isključi svetla u {area}",
    sugg_temperature: "Kolika je temperatura u {area}?",
    sugg_open: "Da li je otvoren prozor u {area}?",
    err_generic: "Došlo je do greške: {message}",
    err_no_speech: "Nisam razumeo, pokušajte ponovo.",
    err_mic: "Mikrofon nije dostupan: {message}",
    err_timeout: "Nema odgovora od Home Assistant-a.",
    err_pipeline: "Assist tok nije pronađen: {id}",
    err_empty: "(nema odgovora)",
    pipeline: "Assist tok",
    pipeline_helper: "Tok za razgovor, glasovni unos i izgovorene odgovore (podrazumevano poželjni)",
    agent_id: "Agent za razgovor (opciono)",
    agent_helper: "Razgovara direktno sa ovim agentom umesto sa agentom toka (odgovori se ne strimuju)",
    title: "Naslov (opciono)",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    area: "Prostor (opciono)",
    area_helper: "Predlozi za ovaj prostor, i prostor dat kao kontekst AI agentima",
    area_context: "Daj prostor kao kontekst",
    show_suggestions: "Prikaži predloge",
    voice: "Glasovni unos (mikrofon)",
    speak: "Čitaj odgovore naglas",
    height: "Visina razgovora",
    language: "Jezik",
    lang_auto: "Automatski",
    illustration: "Animirana ilustracija",
    illustration_theme: "Tema ilustracije",
    theme_auto: "Automatski (sunce ili tamna tema)",
    theme_day: "Dan",
    theme_night: "Noć",
    zoom: "Dugme za detalje",
    zoom_helper: "Dugme gore desno koje prebacuje mini karticu na ceo razgovor i nazad",
    zoom_in: "Prikaži ceo razgovor",
    zoom_out: "Prikaži kompaktnu karticu",
  },
  ro: {
    status_ready: "Gata",
    status_thinking: "Mă gândesc…",
    status_listening: "Ascult…",
    status_transcribing: "Transcriu…",
    status_speaking: "Vorbesc…",
    status_error: "Eroare",
    status_unavailable: "Indisponibil",
    default_title: "Assist",
    preferred: "Pipeline preferat",
    placeholder: "Întreabă Assist…",
    placeholder_area: "Întrebare despre {area}…",
    send: "Trimite",
    mic_start: "Vorbește",
    mic_stop: "Oprește ascultarea",
    new_chat: "Conversație nouă",
    empty_title: "Cu ce te pot ajuta?",
    empty_hint: "Scrie o cerere sau alege o sugestie.",
    empty_hint_voice: "Scrie sau rostește o cerere.",
    tools_used: "Instrumente folosite",
    area_prefix: "În {area}: {text}",
    sugg_lights_on: "Aprinde luminile în {area}",
    sugg_lights_off: "Stinge luminile în {area}",
    sugg_temperature: "Ce temperatură este în {area}?",
    sugg_open: "Este o fereastră deschisă în {area}?",
    err_generic: "Ceva nu a mers: {message}",
    err_no_speech: "Nu am înțeles, încearcă din nou.",
    err_mic: "Microfon indisponibil: {message}",
    err_timeout: "Niciun răspuns de la Home Assistant.",
    err_pipeline: "Pipeline Assist negăsit: {id}",
    err_empty: "(niciun răspuns)",
    pipeline: "Pipeline Assist",
    pipeline_helper: "Pipeline folosit pentru conversație, intrarea vocală și răspunsurile rostite (cel preferat implicit)",
    agent_id: "Agent de conversație (opțional)",
    agent_helper: "Vorbește direct cu acest agent în locul celui din pipeline (răspunsurile nu sunt transmise progresiv)",
    title: "Titlu (opțional)",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    area: "Zonă (opțional)",
    area_helper: "Sugestii pentru această zonă, iar zona dată ca context agenților AI",
    area_context: "Dă zona ca context",
    show_suggestions: "Afișează sugestiile",
    voice: "Intrare vocală (microfon)",
    speak: "Citește răspunsurile cu voce tare",
    height: "Înălțimea conversației",
    language: "Limbă",
    lang_auto: "Automat",
    illustration: "Ilustrație animată",
    illustration_theme: "Tema ilustrației",
    theme_auto: "Automat (soare sau temă întunecată)",
    theme_day: "Zi",
    theme_night: "Noapte",
    zoom: "Buton detalii",
    zoom_helper: "Buton din dreapta sus care comută mini-cardul la conversația completă și înapoi",
    zoom_in: "Afișează conversația completă",
    zoom_out: "Afișează cardul compact",
  },
  da: {
    status_ready: "Klar",
    status_thinking: "Tænker…",
    status_listening: "Lytter…",
    status_transcribing: "Transskriberer…",
    status_speaking: "Taler…",
    status_error: "Fejl",
    status_unavailable: "Utilgængelig",
    default_title: "Assist",
    preferred: "Foretrukken pipeline",
    placeholder: "Spørg Assist…",
    placeholder_area: "Spørg om {area}…",
    send: "Send",
    mic_start: "Tal",
    mic_stop: "Stop med at lytte",
    new_chat: "Ny samtale",
    empty_title: "Hvordan kan jeg hjælpe?",
    empty_hint: "Skriv en forespørgsel eller vælg et forslag.",
    empty_hint_voice: "Skriv eller sig en forespørgsel.",
    tools_used: "Brugte værktøjer",
    area_prefix: "I {area}: {text}",
    sugg_lights_on: "Tænd lyset i {area}",
    sugg_lights_off: "Sluk lyset i {area}",
    sugg_temperature: "Hvad er temperaturen i {area}?",
    sugg_open: "Står et vindue åbent i {area}?",
    err_generic: "Noget gik galt: {message}",
    err_no_speech: "Det fangede jeg ikke, prøv igen.",
    err_mic: "Mikrofon ikke tilgængelig: {message}",
    err_timeout: "Intet svar fra Home Assistant.",
    err_pipeline: "Assist-pipeline ikke fundet: {id}",
    err_empty: "(intet svar)",
    pipeline: "Assist-pipeline",
    pipeline_helper: "Pipeline til samtalen, taleinput og oplæste svar (den foretrukne som standard)",
    agent_id: "Samtaleagent (valgfri)",
    agent_helper: "Taler direkte med denne agent i stedet for pipelinens (svar streames ikke)",
    title: "Titel (valgfri)",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    area: "Område (valgfrit)",
    area_helper: "Forslag til dette område, og området givet som kontekst til AI-agenter",
    area_context: "Giv området som kontekst",
    show_suggestions: "Vis forslag",
    voice: "Taleinput (mikrofon)",
    speak: "Læs svarene højt",
    height: "Samtalens højde",
    language: "Sprog",
    lang_auto: "Automatisk",
    illustration: "Animeret illustration",
    illustration_theme: "Illustrationens tema",
    theme_auto: "Automatisk (sol eller mørkt tema)",
    theme_day: "Dag",
    theme_night: "Nat",
    zoom: "Detaljeknap",
    zoom_helper: "Knap øverst til højre, der skifter minikortet til hele samtalen og tilbage",
    zoom_in: "Vis hele samtalen",
    zoom_out: "Vis det kompakte kort",
  },
  sv: {
    status_ready: "Redo",
    status_thinking: "Tänker…",
    status_listening: "Lyssnar…",
    status_transcribing: "Transkriberar…",
    status_speaking: "Talar…",
    status_error: "Fel",
    status_unavailable: "Inte tillgänglig",
    default_title: "Assist",
    preferred: "Föredragen pipeline",
    placeholder: "Fråga Assist…",
    placeholder_area: "Fråga om {area}…",
    send: "Skicka",
    mic_start: "Tala",
    mic_stop: "Sluta lyssna",
    new_chat: "Ny konversation",
    empty_title: "Hur kan jag hjälpa till?",
    empty_hint: "Skriv en förfrågan eller välj ett förslag.",
    empty_hint_voice: "Skriv eller säg en förfrågan.",
    tools_used: "Använda verktyg",
    area_prefix: "I {area}: {text}",
    sugg_lights_on: "Tänd lamporna i {area}",
    sugg_lights_off: "Släck lamporna i {area}",
    sugg_temperature: "Vad är temperaturen i {area}?",
    sugg_open: "Står ett fönster öppet i {area}?",
    err_generic: "Något gick fel: {message}",
    err_no_speech: "Jag uppfattade inte det, försök igen.",
    err_mic: "Mikrofonen är inte tillgänglig: {message}",
    err_timeout: "Inget svar från Home Assistant.",
    err_pipeline: "Assist-pipeline hittades inte: {id}",
    err_empty: "(inget svar)",
    pipeline: "Assist-pipeline",
    pipeline_helper: "Pipeline för konversationen, röstinmatningen och de upplästa svaren (den föredragna som standard)",
    agent_id: "Konversationsagent (valfri)",
    agent_helper: "Pratar direkt med den här agenten i stället för pipelinens (svaren strömmas inte)",
    title: "Titel (valfri)",
    show_title: "Visa titel",
    show_subtitle: "Visa underrubrik",
    area: "Område (valfritt)",
    area_helper: "Förslag för det här området, och området som kontext till AI-agenter",
    area_context: "Ge området som kontext",
    show_suggestions: "Visa förslag",
    voice: "Röstinmatning (mikrofon)",
    speak: "Läs upp svaren",
    height: "Konversationens höjd",
    language: "Språk",
    lang_auto: "Automatiskt",
    illustration: "Animerad illustration",
    illustration_theme: "Illustrationens tema",
    theme_auto: "Automatiskt (sol eller mörkt tema)",
    theme_day: "Dag",
    theme_night: "Natt",
    zoom: "Detaljknapp",
    zoom_helper: "Knapp uppe till höger som växlar minikortet till hela konversationen och tillbaka",
    zoom_in: "Visa hela konversationen",
    zoom_out: "Visa det kompakta kortet",
  },
  bg: {
    status_ready: "Готов",
    status_thinking: "Мисля…",
    status_listening: "Слушам…",
    status_transcribing: "Транскрибиране…",
    status_speaking: "Говоря…",
    status_error: "Грешка",
    status_unavailable: "Недостъпен",
    default_title: "Assist",
    preferred: "Предпочитан поток",
    placeholder: "Попитайте Assist…",
    placeholder_area: "Въпрос за {area}…",
    send: "Изпрати",
    mic_start: "Говорете",
    mic_stop: "Спри слушането",
    new_chat: "Нов разговор",
    empty_title: "С какво мога да помогна?",
    empty_hint: "Напишете заявка или изберете предложение.",
    empty_hint_voice: "Напишете или кажете заявка.",
    tools_used: "Използвани инструменти",
    area_prefix: "В {area}: {text}",
    sugg_lights_on: "Включи осветлението в {area}",
    sugg_lights_off: "Изключи осветлението в {area}",
    sugg_temperature: "Каква е температурата в {area}?",
    sugg_open: "Има ли отворен прозорец в {area}?",
    err_generic: "Нещо се обърка: {message}",
    err_no_speech: "Не разбрах, опитайте отново.",
    err_mic: "Микрофонът не е достъпен: {message}",
    err_timeout: "Няма отговор от Home Assistant.",
    err_pipeline: "Потокът на Assist не е намерен: {id}",
    err_empty: "(няма отговор)",
    pipeline: "Поток на Assist",
    pipeline_helper: "Поток за разговора, гласовото въвеждане и изговорените отговори (по подразбиране предпочитаният)",
    agent_id: "Агент за разговор (по избор)",
    agent_helper: "Говори директно с този агент вместо с агента на потока (отговорите не се предават поточно)",
    title: "Заглавие (по избор)",
    show_title: "Показване на заглавието",
    show_subtitle: "Показване на подзаглавието",
    area: "Зона (по избор)",
    area_helper: "Предложения за тази зона, и зоната като контекст за AI агентите",
    area_context: "Зоната като контекст",
    show_suggestions: "Показване на предложенията",
    voice: "Гласово въвеждане (микрофон)",
    speak: "Четене на отговорите на глас",
    height: "Височина на разговора",
    language: "Език",
    lang_auto: "Автоматично",
    illustration: "Анимирана илюстрация",
    illustration_theme: "Тема на илюстрацията",
    theme_auto: "Автоматично (слънце или тъмна тема)",
    theme_day: "Ден",
    theme_night: "Нощ",
    zoom: "Бутон за детайли",
    zoom_helper: "Бутон горе вдясно, който превключва мини картата към целия разговор и обратно",
    zoom_in: "Покажи целия разговор",
    zoom_out: "Покажи компактната карта",
  },
  ru: {
    status_ready: "Готов",
    status_thinking: "Думаю…",
    status_listening: "Слушаю…",
    status_transcribing: "Распознаю…",
    status_speaking: "Говорю…",
    status_error: "Ошибка",
    status_unavailable: "Недоступно",
    default_title: "Assist",
    preferred: "Предпочтительный конвейер",
    placeholder: "Спросите Assist…",
    placeholder_area: "Вопрос о {area}…",
    send: "Отправить",
    mic_start: "Говорить",
    mic_stop: "Остановить прослушивание",
    new_chat: "Новый разговор",
    empty_title: "Чем могу помочь?",
    empty_hint: "Введите запрос или выберите подсказку.",
    empty_hint_voice: "Введите или произнесите запрос.",
    tools_used: "Использованные инструменты",
    area_prefix: "В пространстве {area}: {text}",
    sugg_lights_on: "Включи свет в {area}",
    sugg_lights_off: "Выключи свет в {area}",
    sugg_temperature: "Какая температура в {area}?",
    sugg_open: "Открыто ли окно в {area}?",
    err_generic: "Что-то пошло не так: {message}",
    err_no_speech: "Я не расслышал, попробуйте ещё раз.",
    err_mic: "Микрофон недоступен: {message}",
    err_timeout: "Нет ответа от Home Assistant.",
    err_pipeline: "Конвейер Assist не найден: {id}",
    err_empty: "(нет ответа)",
    pipeline: "Конвейер Assist",
    pipeline_helper: "Конвейер для разговора, голосового ввода и озвученных ответов (по умолчанию предпочтительный)",
    agent_id: "Агент разговора (необязательно)",
    agent_helper: "Общается напрямую с этим агентом вместо агента конвейера (ответы не передаются потоком)",
    title: "Заголовок (необязательно)",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    area: "Пространство (необязательно)",
    area_helper: "Подсказки для этого пространства, а также пространство как контекст для ИИ-агентов",
    area_context: "Передавать пространство как контекст",
    show_suggestions: "Показывать подсказки",
    voice: "Голосовой ввод (микрофон)",
    speak: "Зачитывать ответы вслух",
    height: "Высота разговора",
    language: "Язык",
    lang_auto: "Автоматически",
    illustration: "Анимированная иллюстрация",
    illustration_theme: "Тема иллюстрации",
    theme_auto: "Автоматически (солнце или тёмная тема)",
    theme_day: "День",
    theme_night: "Ночь",
    zoom: "Кнопка подробностей",
    zoom_helper: "Кнопка вверху справа, переключающая мини-карточку на полный разговор и обратно",
    zoom_in: "Показать полный разговор",
    zoom_out: "Показать компактную карточку",
  },
  uk: {
    status_ready: "Готово",
    status_thinking: "Думаю…",
    status_listening: "Слухаю…",
    status_transcribing: "Розпізнаю…",
    status_speaking: "Говорю…",
    status_error: "Помилка",
    status_unavailable: "Недоступно",
    default_title: "Assist",
    preferred: "Бажаний конвеєр",
    placeholder: "Запитайте Assist…",
    placeholder_area: "Питання про {area}…",
    send: "Надіслати",
    mic_start: "Говорити",
    mic_stop: "Зупинити прослуховування",
    new_chat: "Нова розмова",
    empty_title: "Чим можу допомогти?",
    empty_hint: "Введіть запит або виберіть підказку.",
    empty_hint_voice: "Введіть або промовте запит.",
    tools_used: "Використані інструменти",
    area_prefix: "У просторі {area}: {text}",
    sugg_lights_on: "Увімкни світло в {area}",
    sugg_lights_off: "Вимкни світло в {area}",
    sugg_temperature: "Яка температура в {area}?",
    sugg_open: "Чи відчинене вікно в {area}?",
    err_generic: "Щось пішло не так: {message}",
    err_no_speech: "Я не розчув, спробуйте ще раз.",
    err_mic: "Мікрофон недоступний: {message}",
    err_timeout: "Немає відповіді від Home Assistant.",
    err_pipeline: "Конвеєр Assist не знайдено: {id}",
    err_empty: "(немає відповіді)",
    pipeline: "Конвеєр Assist",
    pipeline_helper: "Конвеєр для розмови, голосового введення та озвучених відповідей (типово бажаний)",
    agent_id: "Агент розмови (необов'язково)",
    agent_helper: "Спілкується безпосередньо з цим агентом замість агента конвеєра (відповіді не передаються потоком)",
    title: "Заголовок (необов'язково)",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    area: "Простір (необов'язково)",
    area_helper: "Підказки для цього простору, а також простір як контекст для ШІ-агентів",
    area_context: "Передавати простір як контекст",
    show_suggestions: "Показувати підказки",
    voice: "Голосове введення (мікрофон)",
    speak: "Зачитувати відповіді вголос",
    height: "Висота розмови",
    language: "Мова",
    lang_auto: "Автоматично",
    illustration: "Анімована ілюстрація",
    illustration_theme: "Тема ілюстрації",
    theme_auto: "Автоматично (сонце або темна тема)",
    theme_day: "День",
    theme_night: "Ніч",
    zoom: "Кнопка подробиць",
    zoom_helper: "Кнопка вгорі праворуч, що перемикає міні-картку на повну розмову і назад",
    zoom_in: "Показати повну розмову",
    zoom_out: "Показати компактну картку",
  },
  hu: {
    status_ready: "Kész",
    status_thinking: "Gondolkodom…",
    status_listening: "Figyelek…",
    status_transcribing: "Átírás…",
    status_speaking: "Beszélek…",
    status_error: "Hiba",
    status_unavailable: "Nem elérhető",
    default_title: "Assist",
    preferred: "Előnyben részesített folyamat",
    placeholder: "Kérdezd az Assistot…",
    placeholder_area: "Kérdés erről: {area}…",
    send: "Küldés",
    mic_start: "Beszéd",
    mic_stop: "Figyelés leállítása",
    new_chat: "Új beszélgetés",
    empty_title: "Miben segíthetek?",
    empty_hint: "Írj egy kérést, vagy válassz egy javaslatot.",
    empty_hint_voice: "Írj vagy mondj egy kérést.",
    tools_used: "Használt eszközök",
    area_prefix: "Itt: {area}: {text}",
    sugg_lights_on: "Kapcsold fel a lámpákat itt: {area}",
    sugg_lights_off: "Kapcsold le a lámpákat itt: {area}",
    sugg_temperature: "Hány fok van itt: {area}?",
    sugg_open: "Nyitva van ablak itt: {area}?",
    err_generic: "Hiba történt: {message}",
    err_no_speech: "Ezt nem értettem, próbáld újra.",
    err_mic: "A mikrofon nem érhető el: {message}",
    err_timeout: "Nincs válasz a Home Assistanttól.",
    err_pipeline: "Az Assist folyamat nem található: {id}",
    err_empty: "(nincs válasz)",
    pipeline: "Assist folyamat",
    pipeline_helper: "A beszélgetéshez, a hangbevitelhez és a felolvasott válaszokhoz használt folyamat (alapértelmezés szerint az előnyben részesített)",
    agent_id: "Beszélgetési ügynök (opcionális)",
    agent_helper: "Közvetlenül ezzel az ügynökkel beszél a folyamaté helyett (a válaszok nem folyamatosan érkeznek)",
    title: "Cím (opcionális)",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    area: "Terület (opcionális)",
    area_helper: "Javaslatok ehhez a területhez, és a terület kontextusként az MI-ügynököknek",
    area_context: "Terület átadása kontextusként",
    show_suggestions: "Javaslatok megjelenítése",
    voice: "Hangbevitel (mikrofon)",
    speak: "Válaszok felolvasása",
    height: "A beszélgetés magassága",
    language: "Nyelv",
    lang_auto: "Automatikus",
    illustration: "Animált illusztráció",
    illustration_theme: "Az illusztráció témája",
    theme_auto: "Automatikus (nap vagy sötét téma)",
    theme_day: "Nappal",
    theme_night: "Éjszaka",
    zoom: "Részletek gomb",
    zoom_helper: "Jobb felső gomb, amely a mini kártyát a teljes beszélgetésre váltja és vissza",
    zoom_in: "A teljes beszélgetés megjelenítése",
    zoom_out: "A kompakt kártya megjelenítése",
  },
  sk: {
    status_ready: "Pripravené",
    status_thinking: "Premýšľam…",
    status_listening: "Počúvam…",
    status_transcribing: "Prepisujem…",
    status_speaking: "Hovorím…",
    status_error: "Chyba",
    status_unavailable: "Nedostupné",
    default_title: "Assist",
    preferred: "Preferovaný kanál",
    placeholder: "Opýtajte sa Assist…",
    placeholder_area: "Otázka o: {area}…",
    send: "Odoslať",
    mic_start: "Hovoriť",
    mic_stop: "Zastaviť počúvanie",
    new_chat: "Nová konverzácia",
    empty_title: "Ako vám môžem pomôcť?",
    empty_hint: "Napíšte požiadavku alebo vyberte návrh.",
    empty_hint_voice: "Napíšte alebo vyslovte požiadavku.",
    tools_used: "Použité nástroje",
    area_prefix: "V priestore {area}: {text}",
    sugg_lights_on: "Zapni svetlá v {area}",
    sugg_lights_off: "Vypni svetlá v {area}",
    sugg_temperature: "Aká je teplota v {area}?",
    sugg_open: "Je v {area} otvorené okno?",
    err_generic: "Niečo sa pokazilo: {message}",
    err_no_speech: "Nerozumel som, skúste to znova.",
    err_mic: "Mikrofón nie je dostupný: {message}",
    err_timeout: "Žiadna odpoveď od Home Assistant.",
    err_pipeline: "Kanál Assist sa nenašiel: {id}",
    err_empty: "(žiadna odpoveď)",
    pipeline: "Kanál Assist",
    pipeline_helper: "Kanál na konverzáciu, hlasový vstup a čítané odpovede (predvolene preferovaný)",
    agent_id: "Konverzačný agent (voliteľné)",
    agent_helper: "Hovorí priamo s týmto agentom namiesto agenta kanála (odpovede sa nestreamujú)",
    title: "Názov (voliteľné)",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    area: "Oblasť (voliteľné)",
    area_helper: "Návrhy pre túto oblasť a oblasť ako kontext pre AI agentov",
    area_context: "Odovzdať oblasť ako kontext",
    show_suggestions: "Zobraziť návrhy",
    voice: "Hlasový vstup (mikrofón)",
    speak: "Čítať odpovede nahlas",
    height: "Výška konverzácie",
    language: "Jazyk",
    lang_auto: "Automaticky",
    illustration: "Animovaná ilustrácia",
    illustration_theme: "Téma ilustrácie",
    theme_auto: "Automaticky (slnko alebo tmavá téma)",
    theme_day: "Deň",
    theme_night: "Noc",
    zoom: "Tlačidlo detailu",
    zoom_helper: "Tlačidlo vpravo hore, ktoré prepne mini kartu na celú konverzáciu a späť",
    zoom_in: "Zobraziť celú konverzáciu",
    zoom_out: "Zobraziť kompaktnú kartu",
  },
  cs: {
    status_ready: "Připraveno",
    status_thinking: "Přemýšlím…",
    status_listening: "Poslouchám…",
    status_transcribing: "Přepisuji…",
    status_speaking: "Mluvím…",
    status_error: "Chyba",
    status_unavailable: "Nedostupné",
    default_title: "Assist",
    preferred: "Preferovaný kanál",
    placeholder: "Zeptejte se Assistu…",
    placeholder_area: "Otázka na: {area}…",
    send: "Odeslat",
    mic_start: "Mluvit",
    mic_stop: "Zastavit poslech",
    new_chat: "Nová konverzace",
    empty_title: "Jak vám mohu pomoci?",
    empty_hint: "Napište požadavek nebo vyberte návrh.",
    empty_hint_voice: "Napište nebo vyslovte požadavek.",
    tools_used: "Použité nástroje",
    area_prefix: "V prostoru {area}: {text}",
    sugg_lights_on: "Rozsviť světla v {area}",
    sugg_lights_off: "Zhasni světla v {area}",
    sugg_temperature: "Jaká je teplota v {area}?",
    sugg_open: "Je v {area} otevřené okno?",
    err_generic: "Něco se pokazilo: {message}",
    err_no_speech: "Nerozuměl jsem, zkuste to znovu.",
    err_mic: "Mikrofon není dostupný: {message}",
    err_timeout: "Žádná odpověď od Home Assistant.",
    err_pipeline: "Kanál Assist nebyl nalezen: {id}",
    err_empty: "(žádná odpověď)",
    pipeline: "Kanál Assist",
    pipeline_helper: "Kanál pro konverzaci, hlasový vstup a čtené odpovědi (výchozí je preferovaný)",
    agent_id: "Konverzační agent (volitelné)",
    agent_helper: "Mluví přímo s tímto agentem místo agenta kanálu (odpovědi se nestreamují)",
    title: "Název (volitelné)",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podnadpis",
    area: "Oblast (volitelné)",
    area_helper: "Návrhy pro tuto oblast a oblast jako kontext pro AI agenty",
    area_context: "Předat oblast jako kontext",
    show_suggestions: "Zobrazit návrhy",
    voice: "Hlasový vstup (mikrofon)",
    speak: "Číst odpovědi nahlas",
    height: "Výška konverzace",
    language: "Jazyk",
    lang_auto: "Automaticky",
    illustration: "Animovaná ilustrace",
    illustration_theme: "Motiv ilustrace",
    theme_auto: "Automaticky (slunce nebo tmavý motiv)",
    theme_day: "Den",
    theme_night: "Noc",
    zoom: "Tlačítko detailu",
    zoom_helper: "Tlačítko vpravo nahoře, které přepne mini kartu na celou konverzaci a zpět",
    zoom_in: "Zobrazit celou konverzaci",
    zoom_out: "Zobrazit kompaktní kartu",
  },
  sl: {
    status_ready: "Pripravljeno",
    status_thinking: "Razmišljam…",
    status_listening: "Poslušam…",
    status_transcribing: "Prepisujem…",
    status_speaking: "Govorim…",
    status_error: "Napaka",
    status_unavailable: "Ni na voljo",
    default_title: "Assist",
    preferred: "Prednostni cevovod",
    placeholder: "Vprašajte Assist…",
    placeholder_area: "Vprašanje o: {area}…",
    send: "Pošlji",
    mic_start: "Govori",
    mic_stop: "Ustavi poslušanje",
    new_chat: "Nov pogovor",
    empty_title: "Kako vam lahko pomagam?",
    empty_hint: "Vpišite zahtevo ali izberite predlog.",
    empty_hint_voice: "Vpišite ali izgovorite zahtevo.",
    tools_used: "Uporabljena orodja",
    area_prefix: "V prostoru {area}: {text}",
    sugg_lights_on: "Prižgi luči v {area}",
    sugg_lights_off: "Ugasni luči v {area}",
    sugg_temperature: "Kakšna je temperatura v {area}?",
    sugg_open: "Je v {area} odprto okno?",
    err_generic: "Nekaj je šlo narobe: {message}",
    err_no_speech: "Nisem razumel, poskusite znova.",
    err_mic: "Mikrofon ni na voljo: {message}",
    err_timeout: "Ni odgovora od Home Assistant.",
    err_pipeline: "Cevovod Assist ni najden: {id}",
    err_empty: "(ni odgovora)",
    pipeline: "Cevovod Assist",
    pipeline_helper: "Cevovod za pogovor, glasovni vnos in izgovorjene odgovore (privzeto prednostni)",
    agent_id: "Pogovorni agent (neobvezno)",
    agent_helper: "Govori neposredno s tem agentom namesto z agentom cevovoda (odgovori se ne pretakajo)",
    title: "Naslov (neobvezno)",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    area: "Območje (neobvezno)",
    area_helper: "Predlogi za to območje in območje kot kontekst za agente UI",
    area_context: "Podaj območje kot kontekst",
    show_suggestions: "Prikaži predloge",
    voice: "Glasovni vnos (mikrofon)",
    speak: "Glasno beri odgovore",
    height: "Višina pogovora",
    language: "Jezik",
    lang_auto: "Samodejno",
    illustration: "Animirana ilustracija",
    illustration_theme: "Tema ilustracije",
    theme_auto: "Samodejno (sonce ali temna tema)",
    theme_day: "Dan",
    theme_night: "Noč",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Gumb zgoraj desno, ki preklopi mini kartico na celoten pogovor in nazaj",
    zoom_in: "Prikaži celoten pogovor",
    zoom_out: "Prikaži kompaktno kartico",
  },
  lv: {
    status_ready: "Gatavs",
    status_thinking: "Domāju…",
    status_listening: "Klausos…",
    status_transcribing: "Atšifrēju…",
    status_speaking: "Runāju…",
    status_error: "Kļūda",
    status_unavailable: "Nav pieejams",
    default_title: "Assist",
    preferred: "Vēlamā plūsma",
    placeholder: "Jautājiet Assist…",
    placeholder_area: "Jautājums par: {area}…",
    send: "Sūtīt",
    mic_start: "Runāt",
    mic_stop: "Pārtraukt klausīšanos",
    new_chat: "Jauna saruna",
    empty_title: "Kā varu palīdzēt?",
    empty_hint: "Ierakstiet pieprasījumu vai izvēlieties ieteikumu.",
    empty_hint_voice: "Ierakstiet vai pasakiet pieprasījumu.",
    tools_used: "Izmantotie rīki",
    area_prefix: "Telpā {area}: {text}",
    sugg_lights_on: "Ieslēdz gaismas: {area}",
    sugg_lights_off: "Izslēdz gaismas: {area}",
    sugg_temperature: "Kāda ir temperatūra: {area}?",
    sugg_open: "Vai ir atvērts logs: {area}?",
    err_generic: "Kaut kas nogāja greizi: {message}",
    err_no_speech: "Es nesapratu, mēģiniet vēlreiz.",
    err_mic: "Mikrofons nav pieejams: {message}",
    err_timeout: "Nav atbildes no Home Assistant.",
    err_pipeline: "Assist plūsma nav atrasta: {id}",
    err_empty: "(nav atbildes)",
    pipeline: "Assist plūsma",
    pipeline_helper: "Plūsma sarunai, balss ievadei un nolasītajām atbildēm (pēc noklusējuma vēlamā)",
    agent_id: "Sarunu aģents (neobligāti)",
    agent_helper: "Runā tieši ar šo aģentu, nevis ar plūsmas aģentu (atbildes netiek straumētas)",
    title: "Virsraksts (neobligāti)",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    area: "Apgabals (neobligāti)",
    area_helper: "Ieteikumi šim apgabalam, un apgabals kā konteksts MI aģentiem",
    area_context: "Nodot apgabalu kā kontekstu",
    show_suggestions: "Rādīt ieteikumus",
    voice: "Balss ievade (mikrofons)",
    speak: "Nolasīt atbildes skaļi",
    height: "Sarunas augstums",
    language: "Valoda",
    lang_auto: "Automātiski",
    illustration: "Animēta ilustrācija",
    illustration_theme: "Ilustrācijas motīvs",
    theme_auto: "Automātiski (saule vai tumšā tēma)",
    theme_day: "Diena",
    theme_night: "Nakts",
    zoom: "Detaļu poga",
    zoom_helper: "Poga augšējā labajā stūrī, kas pārslēdz mini karti uz pilnu sarunu un atpakaļ",
    zoom_in: "Rādīt pilnu sarunu",
    zoom_out: "Rādīt kompakto karti",
  },
  el: {
    status_ready: "Έτοιμο",
    status_thinking: "Σκέφτομαι…",
    status_listening: "Ακούω…",
    status_transcribing: "Μεταγραφή…",
    status_speaking: "Μιλάω…",
    status_error: "Σφάλμα",
    status_unavailable: "Μη διαθέσιμο",
    default_title: "Assist",
    preferred: "Προτιμώμενη ροή",
    placeholder: "Ρωτήστε το Assist…",
    placeholder_area: "Ερώτηση για: {area}…",
    send: "Αποστολή",
    mic_start: "Μιλήστε",
    mic_stop: "Διακοπή ακρόασης",
    new_chat: "Νέα συνομιλία",
    empty_title: "Πώς μπορώ να βοηθήσω;",
    empty_hint: "Γράψτε ένα αίτημα ή επιλέξτε μια πρόταση.",
    empty_hint_voice: "Γράψτε ή πείτε ένα αίτημα.",
    tools_used: "Εργαλεία που χρησιμοποιήθηκαν",
    area_prefix: "Στον χώρο {area}: {text}",
    sugg_lights_on: "Άναψε τα φώτα στο {area}",
    sugg_lights_off: "Σβήσε τα φώτα στο {area}",
    sugg_temperature: "Τι θερμοκρασία έχει στο {area};",
    sugg_open: "Είναι ανοιχτό κάποιο παράθυρο στο {area};",
    err_generic: "Κάτι πήγε στραβά: {message}",
    err_no_speech: "Δεν το κατάλαβα, δοκιμάστε ξανά.",
    err_mic: "Το μικρόφωνο δεν είναι διαθέσιμο: {message}",
    err_timeout: "Καμία απάντηση από το Home Assistant.",
    err_pipeline: "Η ροή Assist δεν βρέθηκε: {id}",
    err_empty: "(καμία απάντηση)",
    pipeline: "Ροή Assist",
    pipeline_helper: "Ροή για τη συνομιλία, τη φωνητική εισαγωγή και τις εκφωνούμενες απαντήσεις (εξ ορισμού η προτιμώμενη)",
    agent_id: "Πράκτορας συνομιλίας (προαιρετικό)",
    agent_helper: "Μιλά απευθείας με αυτόν τον πράκτορα αντί για τον πράκτορα της ροής (οι απαντήσεις δεν μεταδίδονται σταδιακά)",
    title: "Τίτλος (προαιρετικό)",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    area: "Χώρος (προαιρετικό)",
    area_helper: "Προτάσεις για αυτόν τον χώρο, και ο χώρος ως πλαίσιο για τους πράκτορες ΤΝ",
    area_context: "Ο χώρος ως πλαίσιο",
    show_suggestions: "Εμφάνιση προτάσεων",
    voice: "Φωνητική εισαγωγή (μικρόφωνο)",
    speak: "Ανάγνωση των απαντήσεων φωναχτά",
    height: "Ύψος συνομιλίας",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
    illustration: "Κινούμενη εικονογράφηση",
    illustration_theme: "Θέμα εικονογράφησης",
    theme_auto: "Αυτόματο (ήλιος ή σκούρο θέμα)",
    theme_day: "Ημέρα",
    theme_night: "Νύχτα",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Κουμπί πάνω δεξιά που αλλάζει τη μίνι κάρτα στην πλήρη συνομιλία και πίσω",
    zoom_in: "Εμφάνιση πλήρους συνομιλίας",
    zoom_out: "Εμφάνιση συμπαγούς κάρτας",
  },
};

// ---------------------------------------------------------------------------
// Icons (Material Design Icons, 24 × 24)
// ---------------------------------------------------------------------------

const ICONS = {
  // mdi:robot-happy, the chatbot of the badge.
  bot: "M22 14H21C21 10.13 17.87 7 14 7H13V5.73C13.6 5.39 14 4.74 14 4C14 2.9 13.11 2 12 2S10 2.9 10 4C10 4.74 10.4 5.39 11 5.73V7H10C6.13 7 3 10.13 3 14H2C1.45 14 1 14.45 1 15V18C1 18.55 1.45 19 2 19H3V20C3 21.11 3.9 22 5 22H19C20.11 22 21 21.11 21 20V19H22C22.55 19 23 18.55 23 18V15C23 14.45 22.55 14 22 14M9.79 16.5C9.4 15.62 8.53 15 7.5 15S5.6 15.62 5.21 16.5C5.08 16.19 5 15.86 5 15.5C5 14.12 6.12 13 7.5 13S10 14.12 10 15.5C10 15.86 9.92 16.19 9.79 16.5M18.79 16.5C18.4 15.62 17.5 15 16.5 15S14.6 15.62 14.21 16.5C14.08 16.19 14 15.86 14 15.5C14 14.12 15.12 13 16.5 13S19 14.12 19 15.5C19 15.86 18.92 16.19 18.79 16.5Z",
  mic: "M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z",
  stop: "M18,18H6V6H18V18Z",
  send: "M2,21L23,12L2,3V10L17,12L2,14V21Z",
  new_chat:
    "M12 3C17.5 3 22 6.58 22 11C22 11.58 21.92 12.14 21.78 12.68C21.19 12.38 20.55 12.16 19.88 12.06C19.96 11.72 20 11.36 20 11C20 7.69 16.42 5 12 5C7.58 5 4 7.69 4 11C4 14.31 7.58 17 12 17L13.09 16.95L13 18L13.08 18.95L12 19C10.81 19 9.62 18.83 8.47 18.5C6.64 20 4.37 20.89 2 21C4.33 18.67 4.75 17.1 4.75 16.5C3.06 15.17 2.05 13.15 2 11C2 6.58 6.5 3 12 3M18 14H20V17H23V19H20V22H18V19H15V17H18V14Z",
  speaker:
    "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z",
  alert:
    "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",
  wrench:
    "M22.61,19L13.53,9.91C14.46,7.57 14,4.81 12.09,2.91C9.79,0.61 6.21,0.4 3.66,2.26L7.5,6.11L6.08,7.5L2.25,3.69C0.39,6.23 0.6,9.82 2.9,12.11C4.76,13.97 7.47,14.46 9.79,13.59L18.9,22.7C19.29,23.09 19.92,23.09 20.31,22.7L22.61,20.4C23,20 23,19.39 22.61,19Z",
  expand: "M10 21v-2H6.41l4.5-4.5-1.41-1.41-4.5 4.5V14H3v7zm4.5-10.09 4.5-4.5V10h2V3h-7v2h3.59l-4.5 4.5z",
  collapse: "M19.5 3.09 15 7.59V4h-2v7h7V9h-3.59l4.5-4.5zM4 13v2h3.59l-4.5 4.5 1.41 1.41L9 16.41V20h2v-7z",
};

const SUGGESTION_KEYS = ["sugg_lights_on", "sugg_lights_off", "sugg_temperature", "sugg_open"];
const DEFAULTS = { pipeline: "preferred", height: 360, illustration_theme: "auto" };
// The built-in agent understands set sentences only: a request prefixed with its area would not match any.
const BUILTIN_AGENTS = new Set(["homeassistant", "conversation.home_assistant"]);
// A run that ends neither with an answer nor an error (connection lost) frees the card after this long.
const RUN_TIMEOUT_MS = 120 * 1000;
// Voice input stops on its own after this long, when the voice activity detection did not end it before.
const LISTEN_MAX_MS = 15 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

const errText = (err) => String(err?.message || err?.code || err || "").trim() || "?";

const sameDeps = (a, b) => !!a && a.length === b.length && a.every((d, i) => d === b[i]);

// The spoken answer of a conversation response.
const speechOf = (response) => String(response?.speech?.plain?.speech ?? response?.speech?.ssml?.speech ?? "");

// ---------------------------------------------------------------------------
// Markdown-lite: paragraphs, line breaks, bold, italic, inline code, code blocks, lists, headings and http(s)
// links. Everything is escaped first; only the tags written here come out.
// ---------------------------------------------------------------------------

const inline = (text) =>
  String(text)
    .split(/(`[^`\n]+`)/)
    .map((part, i) => {
      if (i % 2) return `<code>${esc(part.slice(1, -1))}</code>`;
      return esc(part)
        .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\*\*(?=\S)([^*\n]*?\S)\*\*/g, "<strong>$1</strong>")
        .replace(/__(?=\S)([^_\n]*?\S)__/g, "<strong>$1</strong>")
        .replace(/(^|[^*\w])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![*\w])/g, "$1<em>$2</em>")
        .replace(/(^|[^_\w])_(?=[^\s_])([^_\n]*?[^\s_])_(?![_\w])/g, "$1<em>$2</em>");
    })
    .join("");

const LIST_ITEM = /^\s*(?:([-*•+])|(\d+)[.)])\s+(.*)$/;

const blocks = (text) => {
  const out = [];
  let para = [];
  let list = null;
  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(inline).join("<br>")}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.tag}>`);
    list = null;
  };
  for (const line of text.split("\n")) {
    const item = line.match(LIST_ITEM);
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (item) {
      flushPara();
      const tag = item[1] ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      list ||= { tag, items: [] };
      list.items.push(item[3]);
    } else if (heading) {
      flushPara();
      flushList();
      out.push(`<p><strong>${inline(heading[1])}</strong></p>`);
    } else if (list && /^\s{2,}\S/.test(line)) {
      // A continuation line of the last item.
      list.items[list.items.length - 1] += ` ${line.trim()}`;
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return out.join("");
};

// A fence left open (an answer still streaming) holds code up to the end.
const md = (src) =>
  String(src ?? "")
    .replace(/\r\n?/g, "\n")
    .split("```")
    .map((part, i) => (i % 2 ? `<pre><code>${esc(part.replace(/^[\w+.#-]*\n/, "").replace(/\n$/, ""))}</code></pre>` : blocks(part)))
    .join("");

// ---------------------------------------------------------------------------
// DOM patching: brings `from`'s children in line with `to`'s, position by position. Nodes of the same kind are
// kept and updated (text, attributes, then their own children), so that animations do not restart, the text
// typed in the input stays and the chat keeps its scroll position.
// ---------------------------------------------------------------------------

// The width of an element's whole text in fractional pixels, even while an ellipsis cuts it.
const textWidth = (el) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width || el.scrollWidth;
};

const morph = (from, to) => {
  const a = Array.from(from.childNodes);
  const b = Array.from(to.childNodes);
  b.forEach((nb, i) => {
    const na = a[i];
    if (!na) {
      from.appendChild(nb);
      return;
    }
    if (na.nodeType !== nb.nodeType || na.nodeName !== nb.nodeName) {
      from.replaceChild(nb, na);
      return;
    }
    if (nb.nodeType !== 1) {
      if (na.nodeValue !== nb.nodeValue) na.nodeValue = nb.nodeValue;
      return;
    }
    for (const at of Array.from(na.attributes)) if (!nb.hasAttribute(at.name)) na.removeAttribute(at.name);
    for (const at of Array.from(nb.attributes)) if (na.getAttribute(at.name) !== at.value) na.setAttribute(at.name, at.value);
    morph(na, nb);
  });
  for (let i = a.length - 1; i >= b.length; i--) from.removeChild(a[i]);
};

// ---------------------------------------------------------------------------
// Assist pipelines and conversation agents
// ---------------------------------------------------------------------------

// The pipelines, read once per connection: { list, preferred, error }.
const PIPELINES = new WeakMap();
const loadPipelines = (hass) => {
  const key = hass?.connection && typeof hass.connection === "object" ? hass.connection : hass;
  if (!key || typeof hass.callWS !== "function") return Promise.resolve({ list: [], preferred: null, error: "no connection" });
  if (!PIPELINES.has(key)) {
    PIPELINES.set(
      key,
      hass.callWS({ type: "assist_pipeline/pipeline/list" }).then(
        (r) => ({ list: Array.isArray(r?.pipelines) ? r.pipelines : [], preferred: r?.preferred_pipeline ?? null }),
        (err) => ({ list: [], preferred: null, error: errText(err) }),
      ),
    );
  }
  return PIPELINES.get(key);
};

const isPreferred = (id) => !id || id === "preferred" || id === "last_used";

// The pipeline of the config: undefined while the list is not read yet, null when it is not there.
const pickPipeline = (data, id) => {
  if (!data) return undefined;
  const want = isPreferred(id) ? data.preferred : id;
  return data.list.find((p) => p.id === want) || (isPreferred(id) ? data.list[0] || null : null);
};

const isBuiltin = (hass, agentId) => !agentId || BUILTIN_AGENTS.has(agentId) || hass?.entities?.[agentId]?.platform === "conversation";

const agentName = (hass, agentId) => {
  if (!agentId) return "";
  if (agentId === "homeassistant") return "Home Assistant";
  return hass?.states?.[agentId]?.attributes?.friendly_name || agentId;
};

// The integration of an agent entity (its logo), none for the built-in agent.
const agentPlatform = (hass, agentId) => {
  if (isBuiltin(hass, agentId)) return null;
  return hass?.entities?.[agentId]?.platform || null;
};

// Integrations whose logo did not load (offline, unknown brand): not asked for again on every render.
const BROKEN_LOGOS = new Set();
const brandIcon = (domain, dark) => `https://brands.home-assistant.io/_/${encodeURIComponent(domain)}/${dark ? "dark_" : ""}icon.png`;

// Voice input needs the microphone (a secure context: https or localhost) and the Web Audio API.
const voiceSupported = () => !!(globalThis.navigator?.mediaDevices?.getUserMedia && (globalThis.AudioContext || globalThis.webkitAudioContext));

// The suggestion chips: the list of the config, else a few requests about its area.
const suggestionsOf = (hass, config) => {
  if (config.show_suggestions === false) return [];
  if (Array.isArray(config.suggestions)) return config.suggestions.map((s) => String(s ?? "").trim()).filter(Boolean);
  const area = areaName(hass, config);
  return area ? SUGGESTION_KEYS.map((k) => t(hass, config, k, { area })) : [];
};

const areaName = (hass, config) => {
  const id = config?.area;
  if (!id) return "";
  return hass?.areas?.[id]?.name || String(id);
};

// ---------------------------------------------------------------------------
// Microphone: 16-bit PCM mono, the format the pipeline's speech-to-text stage takes over the websocket. A
// MediaRecorder gives compressed audio (WebM/Opus), which the binary handler does not accept: the raw samples
// come from an AudioWorklet (a ScriptProcessor on older browsers) instead.
// ---------------------------------------------------------------------------

const WORKLET = `class AssistCardRecorder extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch && ch.length) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor("assist-card-recorder", AssistCardRecorder);`;

const toPcm16 = (f32) => {
  const out = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
};

class VoiceRecorder {
  constructor(onChunk) {
    this._onChunk = onChunk;
  }

  get sampleRate() {
    return this._ctx?.sampleRate ?? 16000;
  }

  async start() {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
      // 16 kHz when the browser resamples itself; Home Assistant resamples any other rate it is told.
      try {
        this._ctx = new AC({ sampleRate: 16000 });
      } catch (_err) {
        this._ctx = new AC();
      }
      this._src = this._ctx.createMediaStreamSource(this._stream);
      if (this._ctx.audioWorklet && globalThis.AudioWorkletNode) {
        const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
        try {
          await this._ctx.audioWorklet.addModule(url);
        } finally {
          URL.revokeObjectURL(url);
        }
        this._node = new AudioWorkletNode(this._ctx, "assist-card-recorder");
        this._node.port.onmessage = (ev) => this._onChunk(toPcm16(ev.data));
      } else {
        this._node = this._ctx.createScriptProcessor(4096, 1, 1);
        this._node.onaudioprocess = (ev) => this._onChunk(toPcm16(ev.inputBuffer.getChannelData(0)));
      }
      this._src.connect(this._node);
      this._node.connect(this._ctx.destination);
    } catch (err) {
      this.stop();
      throw err;
    }
  }

  stop() {
    try {
      this._src?.disconnect();
      this._node?.disconnect();
    } catch (_err) {
      /* already disconnected */
    }
    if (this._node?.port) this._node.port.onmessage = null;
    for (const track of this._stream?.getTracks?.() || []) track.stop();
    this._ctx?.close?.().catch?.(() => {});
    this._src = this._node = this._stream = this._ctx = null;
  }
}

// ---------------------------------------------------------------------------
// The illustrated header: a living room at the right of the banner (window, sofa, sideboard) with a smart speaker
// on the sideboard, drawn in a 200 × 80 picture whose bottom (y 80) sits on the 10 px parquet strip that runs
// under the whole banner. The speaker shows the state: its light ring in the state's color, sound waves coming in
// while it listens, going out while it speaks, a speech bubble with the dots while it thinks, a « ! » on an error.
// ---------------------------------------------------------------------------

// The scene of each status of the card (_status()).
const SCENE_STATES = { ready: "idle", listening: "listening", transcribing: "thinking", thinking: "thinking", speaking: "speaking", error: "error", unavailable: "off" };

// Night picture: forced by illustration_theme, else the sun below the horizon or Home Assistant's dark mode
// (the dark theme shows the night picture even while the sun is up; an unavailable sun leaves the dark mode alone).
const isNight = (hass, config) => {
  const theme = config?.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return hass?.states?.["sun.sun"]?.state === "below_horizon" || !!hass?.themes?.darkMode;
};

// Three sound arcs beside the speaker: on its left (side -1) or its right (side 1).
const waves = (side) =>
  [0, 1, 2]
    .map((i) => {
      const x = 170 + side * (13 + i * 5.5);
      const h = 6 + i * 3.2;
      return `<path class="as-wave w${i} ${side < 0 ? "l" : "r"}" d="M${x} ${46 - h}Q${x + side * (2.6 + i)} 46 ${x} ${46 + h}"/>`;
    })
    .join("");

// The picture. `uid` keeps the ids of each card's gradients apart on a page with several cards.
const assistScene = (uid, state) => {
  const bubble = {
    listening: `<g class="as-bars">${[0, 1, 2, 3, 4].map((i) => `<rect class="b${i}" x="${125.5 + i * 5}" y="12" width="2.4" height="10" rx="1.2"/>`).join("")}</g>`,
    thinking: `<g class="as-dots"><circle class="d1" cx="129" cy="17" r="2"/><circle class="d2" cx="137" cy="17" r="2"/><circle class="d3" cx="145" cy="17" r="2"/></g>`,
    speaking: `<g class="as-lines"><rect class="l1" x="124" y="12.5" width="26" height="2.2" rx="1.1"/><rect class="l2" x="124" y="18.3" width="18" height="2.2" rx="1.1"/></g>`,
    error: `<g class="as-bang"><rect x="135.8" y="10.5" width="2.4" height="8" rx="1.2"/><circle cx="137" cy="22" r="1.4"/></g>`,
  }[state];
  const sound = state === "listening" ? `<g class="as-in">${waves(-1)}</g>` : state === "speaking" ? `<g class="as-out">${waves(-1)}${waves(1)}</g>` : "";
  return `<div class="as-ground" aria-hidden="true"></div><svg class="as-scene ${state}" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="as-glow-${uid}"><stop offset="0" stop-color="var(--as-ring)" stop-opacity=".55"/><stop offset="1" stop-color="var(--as-ring)" stop-opacity="0"/></radialGradient>
      <clipPath id="as-win-${uid}"><rect x="12" y="10" width="30" height="30" rx="1.5"/></clipPath>
    </defs>
    <g class="as-window">
      <rect class="as-pane" x="12" y="10" width="30" height="30" rx="1.5"/>
      <g clip-path="url(#as-win-${uid})">
        <path class="as-cloud" d="M17 25a3 3 0 0 1 4.6-2.6 3.8 3.8 0 0 1 7.2 1 2.3 2.3 0 0 1 .4 4.6H18.6A2.3 2.3 0 0 1 17 25Z"/>
        <path class="as-moon" d="M33 15.5a4.2 4.2 0 1 0 3.7 6.3 3.4 3.4 0 1 1-3.7-6.3Z"/>
        <circle class="as-star" cx="19" cy="16" r=".7"/><circle class="as-star" cx="25" cy="31" r=".6"/><circle class="as-star" cx="38" cy="33" r=".5"/>
      </g>
      <rect class="as-frame" x="12" y="10" width="30" height="30" rx="1.5"/><path class="as-frame" d="M27 10V40M12 25H42"/>
      <rect class="as-sill" x="9.5" y="40" width="35" height="2.4" rx="1"/>
    </g>
    <g class="as-sofa">
      <rect class="as-sofa-back" x="58" y="47" width="68" height="15" rx="5"/>
      <rect class="as-sofa-seat" x="56" y="58" width="72" height="14" rx="4"/>
      <rect class="as-sofa-arm" x="52" y="52" width="11" height="22" rx="4.5"/><rect class="as-sofa-arm" x="121" y="52" width="11" height="22" rx="4.5"/>
      <rect class="as-cushion" x="66" y="51" width="16" height="10" rx="4" transform="rotate(-8 74 56)"/>
      <path class="as-leg" d="M57 74v6M127 74v6"/>
    </g>
    <g class="as-sideboard">
      <rect class="as-board" x="146" y="62" width="48" height="16" rx="1.6"/><rect class="as-top" x="144.5" y="60.4" width="51" height="2.6" rx="1"/>
      <path class="as-door" d="M170 64.5v11"/><circle class="as-knob" cx="167" cy="70" r=".8"/><circle class="as-knob" cx="173" cy="70" r=".8"/>
      <path class="as-leg" d="M149 78v2M191 78v2"/>
    </g>
    <circle class="as-glow" cx="170" cy="36" r="17" fill="url(#as-glow-${uid})"/>
    ${sound}
    <g class="as-speaker">
      <rect class="as-body" x="161" y="35" width="18" height="25.4" rx="7"/>
      <path class="as-mesh" d="M163.4 44H176.6M163 48.5H177M163.4 53H176.6"/>
      <ellipse class="as-cap" cx="170" cy="35.6" rx="9" ry="2.8"/>
      <ellipse class="as-ring" cx="170" cy="35.6" rx="6.4" ry="1.8"/>
    </g>
    ${bubble ? `<g transform="translate(-24 0)"><g class="as-bubble"><rect x="118" y="6" width="38" height="22" rx="11"/><path d="M147 27l6 6 .4-7.4z"/>${bubble}</g></g>` : ""}
  </svg>`;
};

// The scene's colors and animations, day and night (only in the card's styles when the illustration is shown).
const SCENE_STYLE = `
  .banner { position: relative; overflow: hidden; height: var(--as-banner-h, 90px); color: #2b2a33; background: #f4ede3;
            --as-ground-h: 10px; --as-scene-w: calc((var(--as-banner-h, 90px) - var(--as-ground-h)) * 2.5); }
  .banner.night { color: #fff; background: #2a2f3d; }
  .as-scene { position: absolute; right: 0; bottom: var(--as-ground-h); height: calc(100% - var(--as-ground-h)); width: min(var(--as-scene-w), 62%, 100cqw - 250px); overflow: hidden; }
  .as-ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--as-ground-h);
               background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow: inset 0 2px 0 #a97c50; }
  .night .as-ground { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #5a4634; }
  .as-pane { fill: #bfe0f7; } .night .as-pane { fill: #1b2f52; }
  .as-frame { fill: none; stroke: #fff; stroke-width: 1.6; } .night .as-frame { stroke: #4a5568; }
  .as-sill { fill: #e4d9c8; } .night .as-sill { fill: #3f4757; }
  .as-cloud { fill: #fff; opacity: .95; animation: as-drift 6s ease-in-out infinite alternate; }
  .as-moon, .as-star { fill: #f4f1dc; display: none; }
  .night .as-moon, .night .as-star { display: inline; } .night .as-cloud { display: none; }
  .as-sofa-back, .as-sofa-arm { fill: #8f88db; } .as-sofa-seat { fill: #9d97e0; } .as-cushion { fill: #f2c46d; }
  .night .as-sofa-back, .night .as-sofa-arm { fill: #433d68; } .night .as-sofa-seat { fill: #4a4470; } .night .as-cushion { fill: #8a6f3e; }
  .as-leg { stroke: #6e5a45; stroke-width: 1.6; stroke-linecap: round; } .night .as-leg { stroke: #2a2420; }
  .as-board { fill: #c9b79c; } .as-top { fill: #b49f80; } .as-door { stroke: #b19c7d; stroke-width: .7; } .as-knob { fill: #8a7658; }
  .night .as-board { fill: #3c4558; } .night .as-top { fill: #4a5468; } .night .as-door { stroke: #2f3746; } .night .as-knob { fill: #6c7890; }
  /* The speaker: a dark fabric cylinder by day, a lighter one at night so that it stays visible on the dark room. */
  .as-body { fill: #2f3540; } .as-cap { fill: #444c5a; } .as-mesh { stroke: #404754; stroke-width: .6; stroke-linecap: round; }
  .night .as-body { fill: #5a6476; } .night .as-cap { fill: #707b8f; } .night .as-mesh { stroke: #6b7588; }
  .as-scene { --as-ring: var(--c, var(--ac-accent)); }
  .as-ring { fill: none; stroke: var(--as-ring); stroke-width: 1.4; }
  .as-glow { opacity: .6; transform-box: fill-box; transform-origin: center; }
  .idle .as-glow { animation: as-breathe 3.2s ease-in-out infinite; }
  .off .as-glow { display: none; } .off .as-ring { stroke: #8b93a1; opacity: .7; } .off .as-speaker { opacity: .75; }
  .listening .as-glow, .speaking .as-glow { opacity: .9; animation: as-breathe 1.2s ease-in-out infinite; }
  .thinking .as-ring { stroke-dasharray: 6 4; animation: as-spin 1s linear infinite; }
  .as-wave { fill: none; stroke: var(--as-ring); stroke-width: 1.5; stroke-linecap: round; opacity: 0; transform-box: fill-box; transform-origin: center; }
  .as-out .as-wave.l { animation: as-out-l 1.5s ease-out infinite; } .as-out .as-wave.r { animation: as-out-r 1.5s ease-out infinite; }
  .as-in .as-wave { animation: as-in 1.5s ease-in infinite; }
  .as-wave.w1 { animation-delay: -.5s !important; } .as-wave.w2 { animation-delay: -1s !important; }
  .as-bubble > rect, .as-bubble > path { fill: #ece9ff; } .night .as-bubble > rect, .night .as-bubble > path { fill: #3a3f60; }
  .as-bubble { animation: as-pop .35s ease-out both; transform-box: fill-box; transform-origin: 80% 100%; }
  .as-dots circle { fill: #7f77dd; animation: as-bounce 1.2s ease-in-out infinite; transform-box: fill-box; }
  .night .as-dots circle { fill: #a9a3ff; }
  .as-dots .d2 { animation-delay: .15s; } .as-dots .d3 { animation-delay: .3s; }
  .as-bars rect { fill: var(--as-ring); transform-box: fill-box; transform-origin: center; animation: as-bar .9s ease-in-out infinite; }
  .as-bars .b1 { animation-delay: -.3s; } .as-bars .b2 { animation-delay: -.6s; } .as-bars .b3 { animation-delay: -.15s; } .as-bars .b4 { animation-delay: -.45s; }
  .as-lines rect { fill: var(--as-ring); opacity: .85; transform-box: fill-box; transform-origin: left center; animation: as-type 2.4s ease-out infinite; }
  .as-lines .l2 { animation-delay: .4s; }
  .as-bang * { fill: var(--as-ring); }
  .error .as-speaker { animation: as-shake 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
  @keyframes as-drift { to { transform: translateX(3px); } }
  @keyframes as-breathe { 0%, 100% { transform: scale(.85); opacity: .45; } 50% { transform: scale(1.1); opacity: .95; } }
  @keyframes as-spin { to { stroke-dashoffset: -20; } }
  @keyframes as-out-l { 0% { opacity: 0; transform: translateX(0); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateX(-4px); } }
  @keyframes as-out-r { 0% { opacity: 0; transform: translateX(0); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateX(4px); } }
  @keyframes as-in { 0% { opacity: 0; transform: translateX(-5px); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateX(2px); } }
  @keyframes as-pop { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes as-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-2.5px); opacity: 1; } }
  @keyframes as-bar { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  @keyframes as-type { 0% { transform: scaleX(0); } 40%, 85% { transform: scaleX(1); } 100% { transform: scaleX(1); opacity: 0; } }
  @keyframes as-shake { 0%, 80%, 100% { transform: rotate(0); } 84% { transform: rotate(-4deg); } 88% { transform: rotate(4deg); } 92% { transform: rotate(-2deg); } 96% { transform: rotate(2deg); } }
  @media (prefers-reduced-motion: reduce) {
    .as-scene *, .as-scene { animation: none !important; }
    .as-wave { opacity: .8; } .as-bubble { opacity: 1; }
  }
`;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --ac-accent: #7e57c2; --ac-ok: var(--success-color, #43a047); --ac-warn: var(--warning-color, #ffa600);
          --ac-crit: var(--error-color, #db4437); --ac-idle: var(--disabled-text-color, #9e9e9e); --ac-active: var(--info-color, #039be5); }
  ha-card { overflow: hidden; container: as-card / inline-size; }
  /* A size container has no width of its own: this zero-height grid gives the card a natural width without a minimum. */
  :host { display: block; min-width: 0; --ac-natural-width: 400px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--ac-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  button:focus-visible, [role="button"]:focus-visible { outline: 2px solid var(--primary-color, var(--ac-accent)); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  .ok { --c: var(--ac-ok); } .warn { --c: var(--ac-warn); } .crit { --c: var(--ac-crit); } .idle { --c: var(--ac-idle); }
  .active { --c: var(--ac-active); } .accent { --c: var(--ac-accent); }
  /* Title row: icon, titles, status pill (aligned on the title line), new conversation and detail buttons. */
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .header:has(.sub) > .hbtn { margin-bottom: 14.4px; }
  .titles { flex: 1 1 0; min-width: 5ch; }
  /* The status pill right after the title, its whole label on one line, while the title stays whole beside it
     (measured by the card, see _fitPill); otherwise on its own line under a one-line subtitle, and with its dot alone
     when even that does not fit the header. */
  .tline { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .tline > .name { flex: 0 1 auto; min-width: 0; }
  .tline > .pill { flex: none; max-width: none; }
  .tline > .pill .pill-text { white-space: nowrap; overflow: visible; }
  .titles.below { display: grid; grid-template-columns: minmax(0, 1fr); align-content: center; }
  .titles.below > .tline { display: contents; }
  .titles.below > .tline > .pill { order: 3; justify-self: start; align-self: start; margin-top: 3px; }
  .titles.below > .sub { order: 2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .titles.dot-only > .tline { display: flex; }
  .titles.dot-only > .tline > .pill { order: 0; margin-top: 0; align-self: center; padding: 4px; }
  .titles.dot-only > .tline > .pill .pill-text { display: none; }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* The badge in the color of the status, like the pill: accent when ready, red listening, blue thinking, green speaking,
     amber on an error, grey when unavailable. */
  .badge { display: flex; flex: none; width: 40px; height: 40px; border-radius: 50%; align-items: center; justify-content: center;
           background: color-mix(in srgb, var(--c) 16%, transparent); transition: background-color .2s ease; }
  .badge.clickable { cursor: pointer; }
  .badge .icon.type { width: 24px; height: 24px; fill: color-mix(in srgb, var(--c) 60%, var(--primary-text-color)); }
  /* The agent's integration logo, small, before its name in the subtitle. */
  .sub .logo { width: 14px; height: 14px; margin-inline-end: 4px; vertical-align: -2px; border-radius: 3px; object-fit: contain; }
  .pill { display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c) 15%, transparent); color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 45%; overflow: hidden; box-sizing: border-box; }
  .pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c); flex: none; }
  .pill-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  /* Smoked-glass and outline buttons: never filled, the accent color for an active one. */
  .hbtn, .ibtn, .chip { all: unset; box-sizing: border-box; cursor: pointer; color: var(--secondary-text-color);
          transition: background-color .2s ease, color .2s ease, border-color .2s ease, opacity .2s ease; }
  .hbtn { flex: none; width: 24px; height: 24px; margin: -2px -4px 0 0; border-radius: 50%; display: grid; place-items: center;
          background: color-mix(in srgb, var(--ac-idle) 10%, transparent); border: 1px solid color-mix(in srgb, var(--ac-idle) 28%, transparent); }
  .hbtn:hover { background: color-mix(in srgb, var(--ac-idle) 18%, transparent); color: var(--primary-text-color); }
  .hbtn + .hbtn { margin-left: -4px; }
  .hbtn .icon { width: 14px; height: 14px; }
  /* The main button of the input bar: a round outline ring in the accent color (the microphone, or send once there is text). */
  .ibtn { flex: none; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; position: relative; background: transparent;
          border: 2px solid color-mix(in srgb, var(--ac-accent) 70%, transparent); color: color-mix(in srgb, var(--ac-accent) 75%, var(--primary-text-color)); }
  .ibtn .icon { width: 22px; height: 22px; }
  .ibtn:hover:not([disabled]) { border-color: var(--ac-accent); background: color-mix(in srgb, var(--ac-accent) 8%, transparent); }
  .ibtn[disabled] { cursor: default; opacity: .4; }
  .ibtn.big { width: 68px; height: 68px; border-width: 2px; }
  .ibtn.big .icon { width: 30px; height: 30px; }
  /* Listening: the ring pulses outwards (two waves), the icon turns to stop. */
  .ibtn.on { border-color: var(--ac-accent); }
  .ibtn.on::before, .ibtn.on::after { content: ""; position: absolute; inset: -2px; border-radius: 50%; border: 2px solid var(--ac-accent);
             animation: ac-pulse 1.6s ease-out infinite; pointer-events: none; }
  .ibtn.on::after { animation-delay: -.8s; }
  @keyframes ac-pulse { from { transform: scale(1); opacity: .75; } to { transform: scale(1.4); opacity: 0; } }
  .inputbar { display: flex; align-items: center; gap: 8px; padding: 10px 12px 12px; }
  .text { flex: 1 1 auto; min-width: 0; height: 44px; box-sizing: border-box; padding: 0 16px; border-radius: 22px; font: inherit; font-size: 14px;
          color: var(--primary-text-color); background: color-mix(in srgb, var(--ac-idle) 8%, transparent);
          border: 1px solid color-mix(in srgb, var(--ac-idle) 30%, transparent); outline: none; transition: border-color .2s ease; text-overflow: ellipsis; }
  .text::placeholder { color: var(--secondary-text-color); opacity: 1; }
  .text:focus { border-color: color-mix(in srgb, var(--ac-accent) 70%, transparent); }
  .text[disabled] { opacity: .6; }
  /* Suggestion chips: outline pills on one line, scrolled sideways when they do not fit. */
  .chips { display: flex; flex-wrap: nowrap; gap: 6px; overflow-x: auto; scrollbar-width: none; max-width: 100%; box-sizing: border-box;
           -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); }
  .chips::-webkit-scrollbar { display: none; }
  .chip { flex: none; padding: 5px 12px; border-radius: 16px; font-size: 12px; line-height: 1.3; max-width: 85%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          border: 1px solid color-mix(in srgb, var(--ac-accent) 45%, transparent); color: color-mix(in srgb, var(--ac-accent) 55%, var(--primary-text-color)); }
  .chip:hover { border-color: var(--ac-accent); background: color-mix(in srgb, var(--ac-accent) 8%, transparent); }
  .bubble { padding: 8px 12px; border-radius: 16px; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; max-width: 85%; box-sizing: border-box; }
  .user .bubble { white-space: pre-wrap; border-bottom-right-radius: 5px; color: var(--primary-text-color);
                  background: color-mix(in srgb, var(--ac-accent) 16%, transparent); border: 1px solid color-mix(in srgb, var(--ac-accent) 26%, transparent); }
  .assistant .bubble { border-bottom-left-radius: 5px; background: var(--secondary-background-color, rgba(127,127,127,.1)); }
  .error .bubble { display: flex; gap: 8px; align-items: flex-start; border-bottom-left-radius: 5px; --c: var(--ac-crit);
                   background: color-mix(in srgb, var(--c) 10%, transparent); border: 1px solid color-mix(in srgb, var(--c) 32%, transparent);
                   color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
  .error .bubble .icon { color: var(--c); margin-top: 1px; }
  .md > :first-child { margin-top: 0; } .md > :last-child { margin-bottom: 0; }
  .md p { margin: 0 0 6px; } .md ul, .md ol { margin: 0 0 6px; padding-left: 20px; } .md li { margin: 2px 0; }
  .md code { font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace); font-size: .88em; padding: 1px 5px; border-radius: 5px;
             background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
  .md pre { margin: 0 0 6px; padding: 8px 10px; border-radius: 8px; overflow-x: auto; background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); }
  .md pre code { padding: 0; background: none; font-size: 12px; white-space: pre; }
  .md a { color: var(--primary-color, var(--ac-accent)); }
  /* The caret at the end of the text being streamed: after the last paragraph, or in the last item of a list. */
  .streaming > :is(p, pre):last-child::after, .streaming > :is(ul, ol):last-child > li:last-child::after { content: ""; display: inline-block; width: .5em; height: 1.05em; margin-left: 2px; vertical-align: text-bottom;
                                    border-radius: 2px; background: color-mix(in srgb, var(--ac-accent) 70%, var(--primary-text-color)); animation: ac-caret 1s steps(1) infinite; }
  @keyframes ac-caret { 50% { opacity: 0; } }
  .typing { display: inline-flex; gap: 4px; align-items: center; padding: 12px 14px; }
  .typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--secondary-text-color); animation: ac-bounce 1.2s ease-in-out infinite; }
  .typing span:nth-child(2) { animation-delay: .15s; } .typing span:nth-child(3) { animation-delay: .3s; }
  @keyframes ac-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-5px); opacity: 1; } }
  .tools { display: flex; flex-wrap: wrap; gap: 4px; }
  .tool { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 1px 8px; border-radius: 10px; color: var(--secondary-text-color);
          border: 1px dashed color-mix(in srgb, var(--ac-idle) 45%, transparent); }
  .tool .icon { width: 12px; height: 12px; }
  .warning { padding: 10px 12px; border-radius: 10px; font-size: 13px; --c: var(--ac-warn); color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color));
             background: color-mix(in srgb, var(--c) 12%, transparent); border: 1px solid color-mix(in srgb, var(--c) 35%, transparent); }
  @container as-card (max-width: 200px) {
    .pill { padding: 4px; flex: none; }
    .pill-text { display: none; }
  }
  @container as-card (max-width: 260px) {
    .header { gap: 6px; }
    .bubble { max-width: 92%; }
  }
`;

const FULL_STYLE = `
  /* The chat grows with the conversation up to its height (the height option), then scrolls: a short one leaves no
     empty block above the suggestions and the input bar, which stay at the bottom of the card. */
  .chat { max-height: var(--ac-height, 360px); overflow-y: auto; overscroll-behavior: contain; padding: 12px; box-sizing: border-box;
          display: flex; flex-direction: column; gap: 8px; scrollbar-width: thin; border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.2)); }
  .msg { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
  .msg.user { align-items: flex-end; }
  .empty { margin: auto 0; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: 12px 4px; }
  .empty .big { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; background: color-mix(in srgb, var(--ac-accent) 12%, transparent); }
  .empty .big .icon { width: 28px; height: 28px; color: color-mix(in srgb, var(--ac-accent) 60%, var(--primary-text-color)); }
  .empty .t { font-size: 16px; font-weight: 500; }
  .empty .h { font-size: 13px; color: var(--secondary-text-color); }
  .suggest { padding: 10px 12px 0; }
  .suggest + .inputbar { padding-top: 8px; }
`;

const MINI_STYLE = `
  :host { --ac-natural-width: 320px; }
  /* Voice first: the big microphone in the middle, the last question in quotes and its answer under it, the chips. */
  .voice { padding: 14px 12px 12px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; min-width: 0; }
  .voice .ibtn.big { margin: 8px 0 12px; }
  .voice .h { font-size: 13px; color: var(--secondary-text-color); }
  .voice .q { font-size: 13px; font-style: italic; color: var(--secondary-text-color); max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .voice .q::before { content: "“"; } .voice .q::after { content: "”"; }
  .voice .msg { display: flex; flex-direction: column; align-items: center; gap: 4px; max-width: 100%; }
  .voice .bubble { max-width: 100%; text-align: start; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; overflow: hidden; }
  .voice .error .bubble, .voice .bubble.typing { display: flex; }
  .voice .tools { justify-content: center; }
  .voice .chips { width: 100%; }
  .voice .chips > :first-child { margin-inline-start: auto; } .voice .chips > :last-child { margin-inline-end: auto; }
  .voice + .inputbar { padding-top: 0; }
`;

// The illustrated header's layout: the round icon, the title, the status and the subtitle on the room's wall at the
// left, the scene at the right (at most 62 % of the card), the buttons on frosted circles at the top right.
const BANNER_STYLE = `
  .htext { position: absolute; z-index: 1; left: 12px; top: 0; bottom: var(--as-ground-h); right: calc(min(var(--as-scene-w), 62%, 100cqw - 250px) + 4px);
           display: flex; align-items: center; gap: 10px; min-width: 0; }
  .htext .titles { container: as-titles / inline-size; align-self: stretch; display: grid; grid-template-columns: minmax(0, 1fr); align-content: center; row-gap: 1px; min-width: 0; flex: 1 1 0; }
  /* The status pill right after the title, centred on it, in the icon's color (placed by _fitPill); below 200 px, its
     dot alone. */
  .banner .name { font-size: 16px; font-weight: 500; }
  .banner .badge { position: relative; background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
  .banner.night .badge { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner .badge .icon.type { fill: var(--c); }
  .banner.night .badge .icon.type { fill: color-mix(in srgb, var(--c) 72%, #fff); }
  /* The agent's integration logo on a white tile at the bottom right of the icon, readable on any theme. */
  .blogo { position: absolute; right: -4px; bottom: -4px; width: 18px; height: 18px; border-radius: 5px; padding: 2px; box-sizing: border-box;
           display: grid; place-items: center; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.18); }
  .blogo img { width: 100%; height: 100%; object-fit: contain; }
  .banner .pill { gap: 4px; padding: 1px 8px;
                  background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .pill { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner .pill .dot { width: 7px; height: 7px; }
  .banner .sub { color: #77707a; }
  .banner.night .sub { color: rgba(255,255,255,.62); }
  /* The header buttons on 24 px glass discs on the banner's top line: the detail button in the top-right corner, the
     new conversation button at its left; the scene keeps clear of them. */
  .hbtns { position: absolute; z-index: 2; top: 5px; right: 5px; display: flex; gap: 4px; }
  .banner .hbtn { margin: 0; width: 24px; height: 24px; border: 0; color: #33506b; background: rgba(255,255,255,.55);
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner.night .hbtn { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner .hbtn:hover { background: rgba(255,255,255,.75); }
  .banner.night .hbtn:hover { background: rgba(255,255,255,.22); }
  .banner .hbtn .icon { width: 16px; height: 16px; }
  .banner .hbtn + .hbtn { margin-left: 0; }
  .banner.has-btns .as-scene { right: 30px; }
  .banner.has-btns .htext { right: calc(min(var(--as-scene-w), 62%, 100cqw - 250px) + 34px); }
  /* Narrow card: no room for the scene beside the text, the room's wall and floor alone stay. */
  @container (max-width: 300px) { .as-scene { display: none; } .htext, .banner.has-btns .htext { right: 40px; } .banner.btns-2 .htext { right: 64px; } }
  @container as-card (max-width: 200px) { .banner .pill { padding: 4px; } .banner .pill-text { display: none; } }
`;

// Element names of Home Assistant dialogs (more-info opened from the card, among others).
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS a tap on something that is not
// clickable sends no click to the page. It counts when the press and the release are both outside the card; a
// scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click event.
const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOutside(card, ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOutside(card, ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOutside(card, ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    // A tap (press and release at the same spot), for the tests.
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

// Numbers the cards of a page: the ids of each card's illustration stay apart.
let cardUid = 0;

class AssistCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // The conversation, kept while the card lives: { role: user | assistant | error, text, tools, streaming, run }.
    this._messages = [];
    this._conversationId = null;
    this._busy = false;
    this._voice = null;
    this._speaking = false;
    this._run = 0;
    this._stick = true;
    this._uid = ++cardUid;
    const root = this.shadowRoot;
    root.addEventListener("click", (ev) => this._onClick(ev));
    root.addEventListener("keydown", (ev) => this._onKey(ev));
    // The main button turns from the microphone to send once there is text (a render only when that flips).
    root.addEventListener("input", (ev) => {
      if (!ev.target?.classList?.contains("text")) return;
      const has = !!ev.target.value?.trim();
      if (has !== !!this._hasText) {
        this._hasText = has;
        this._update();
      }
    });
    root.addEventListener?.(
      "error",
      (ev) => {
        const p = ev.target?.dataset?.platform;
        if (!p) return;
        BROKEN_LOGOS.add(p);
        (ev.target.parentElement?.classList?.contains("blogo") ? ev.target.parentElement : ev.target).remove();
      },
      true,
    );
    // Following the conversation: the chat scrolls down with new messages unless it was scrolled up to read.
    root.addEventListener?.(
      "scroll",
      (ev) => {
        const el = ev.target;
        if (el?.classList?.contains("chat")) this._stick = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      },
      true,
    );
  }

  static getConfigElement() {
    return document.createElement("assist-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first || !this._pipelines) this._loadPipelines();
    const deps = this._deps();
    if (sameDeps(this._lastDeps, deps)) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // What a render reads from hass: the language, the theme, the sun (the illustration's night), the agent's state and
  // registry entry, the area.
  _deps() {
    const h = this._hass;
    const agent = this._agentId();
    return [
      h.language,
      h.locale,
      h.themes?.darkMode,
      h.states?.["sun.sun"]?.state,
      h.entities?.[agent],
      h.states?.[agent],
      this._config?.area && h.areas?.[this._config.area],
      this._pipelines,
    ];
  }

  _loadPipelines() {
    if (this._pipelinesLoading || !this._hass) return;
    this._pipelinesLoading = true;
    loadPipelines(this._hass).then((data) => {
      this._pipelinesLoading = false;
      this._pipelines = data;
      this._update();
    });
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    if (config.suggestions !== undefined && !Array.isArray(config.suggestions)) throw new Error("suggestions must be a list of texts");
    const prev = this._config;
    // Another pipeline or agent: another conversation.
    if (prev && ((prev.pipeline || "") !== (config.pipeline || "") || (prev.agent_id || "") !== (config.agent_id || ""))) this._newConversation();
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._lastDeps = null;
    this._update();
  }

  connectedCallback() {
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._resize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._fitWidth) return;
        this._fitWidth = w;
        cancelAnimationFrame(this._fitFrame);
        this._fitFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._resize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    if (this._hass && this._config) this._update();
  }

  disconnectedCallback() {
    this._resize?.disconnect();
    this._fitWidth = null;
    // Off the page: the microphone is released and the speech stopped; the conversation stays for the next visit.
    if (this._voice) this._cancelVoice();
    this._stopAudio();
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  // ---- Pipeline and agent --------------------------------------------------

  _pipeline() {
    return pickPipeline(this._pipelines, this._config?.pipeline);
  }

  // The pipeline id sent with a run: none for the preferred one (Home Assistant picks it).
  _pipelineArg() {
    const id = this._config.pipeline;
    return isPreferred(id) ? {} : { pipeline: id };
  }

  _agentId() {
    return this._config?.agent_id || this._pipeline()?.conversation_engine || "";
  }

  _problem() {
    const c = this._config;
    if (!c.agent_id && !isPreferred(c.pipeline) && this._pipelines && !this._pipelines.error && this._pipeline() === null) {
      return this._t("err_pipeline", { id: c.pipeline });
    }
    return "";
  }

  _unavailable() {
    const s = this._hass?.states?.[this._agentId()];
    return !!this._problem() || s?.state === "unavailable";
  }

  _micAvailable() {
    if (this._config.voice === false || !voiceSupported()) return false;
    const p = this._pipeline();
    return !!p?.stt_engine;
  }

  // ---- Rendering -----------------------------------------------------------

  // The header's status pill goes right after the title, on its row, only while the title stays whole and the
  // pill's whole label fits beside it; otherwise it takes a line of its own under the subtitle (.below), the title
  // whole on its row (cut only when it does not fit alone). There, in the banner, the subtitle keeps one line; if the
  // text still does not fit above the ground strip, the pill keeps its dot alone (.dot-only, its label in its tooltip
  // and for screen readers). Measured after each render and on each new width, whatever the language: no fixed
  // width threshold.
  _fitPill() {
    if (!this.isConnected) return;
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const row = t.querySelector(".tline");
      const pills = row ? [...row.children].filter((n) => n.matches(".pill")) : [];
      if (!pills.length || !pills[0].getBoundingClientRect) continue;
      t.classList.remove("below", "dot-only");
      const name = row.querySelector(".name");
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const title = name && getComputedStyle(name).display !== "none" ? textWidth(name) + gap : 0;
      const need = pills.reduce((w, p) => w + p.getBoundingClientRect().width + gap, title - gap);
      if (need > t.getBoundingClientRect().width - 0.5) {
        t.classList.add("below");
        const banner = t.closest(".banner");
        if (banner) {
          const b = banner.getBoundingClientRect();
          const out = [...t.querySelectorAll("*")].some((n) => {
            const r = n.getBoundingClientRect();
            return r.height > 0 && (r.top < b.top - 0.5 || r.bottom > b.bottom - (parseFloat(getComputedStyle(banner).getPropertyValue("--as-ground-h")) || 10) + 0.5);
          });
          if (out) t.classList.add("dot-only");
        }
      }
      // A subtitle cut by its ellipsis keeps its whole text in its tooltip.
      const s = t.querySelector(".sub");
      if (s && (!s.hasAttribute("title") || s.dataset.fit)) {
        const cut = s.scrollWidth > s.clientWidth + 1;
        s.toggleAttribute("data-fit", cut);
        if (cut) s.title = s.textContent.trim();
        else s.removeAttribute("title");
      }
    }
  }


  _update() {
    if (!this._hass || !this._config) return;
    const html = this._render();
    const root = this.shadowRoot;
    if (html === this._html) return;
    this._html = html;
    if (!root.firstChild || typeof document.createElement("template").content === "undefined") root.innerHTML = html;
    else {
      const tpl = document.createElement("template");
      tpl.innerHTML = html;
      morph(root, tpl.content);
    }
    this._fitPill();
    const chat = root.querySelector?.(".chat");
    if (chat && this._stick) chat.scrollTop = chat.scrollHeight;
  }

  _status() {
    if (this._voice === "listening") return ["listening", "crit"];
    if (this._voice === "transcribing") return ["transcribing", "active"];
    if (this._busy) return ["thinking", "active"];
    if (this._speaking) return ["speaking", "ok"];
    if (this._unavailable()) return ["unavailable", "idle"];
    if (this._messages.at(-1)?.role === "error") return ["error", "warn"];
    return ["ready", "accent"];
  }

  // The subtitle (HTML): the pipeline, then the agent with its integration's logo before its name (on the icon instead
  // in the illustrated header).
  _subtitle() {
    const c = this._config;
    const id = this._agentId();
    const agent = agentName(this._hass, id);
    const platform = agentPlatform(this._hass, id);
    const dark = !!this._hass.themes?.darkMode;
    const logo = platform && !BROKEN_LOGOS.has(platform) && !this._illustrated() ? `<img data-platform="${esc(platform)}" class="logo" src="${esc(brandIcon(platform, dark))}" alt="">` : "";
    const withLogo = agent ? `${logo}${esc(agent)}` : "";
    if (c.agent_id) return withLogo;
    const p = this._pipeline();
    const name = p?.name || (isPreferred(c.pipeline) ? this._t("preferred") : c.pipeline);
    return [esc(name), agent && agent !== name ? withLogo : ""].filter(Boolean).join(" · ");
  }

  _illustrated() {
    return this._config?.illustration !== false;
  }

  // The round icon, in the color of the status: the chatbot in the classic header, the microphone in the illustrated
  // one, with the agent's integration logo on it.
  _badge(cls) {
    const agent = this._agentId();
    const entity = agent && this._hass.states?.[agent] ? agent : "";
    const attrs = entity ? ` clickable" role="button" tabindex="0" data-action="more" data-entity="${esc(entity)}" title="${esc(agentName(this._hass, agent))}"` : '"';
    if (!this._illustrated()) return `<span class="badge ${cls}${attrs}>${svgIcon(ICONS.bot, "type")}</span>`;
    const platform = agentPlatform(this._hass, agent);
    const logo =
      platform && !BROKEN_LOGOS.has(platform)
        ? `<span class="blogo"><img data-platform="${esc(platform)}" src="${esc(brandIcon(platform, false))}" alt=""></span>`
        : "";
    return `<span class="badge ${cls}${attrs}>${svgIcon(ICONS.mic, "type")}${logo}</span>`;
  }

  _header(sub, compact = false) {
    const [key, cls] = this._status();
    const text = this._t(`status_${key}`);
    const fresh = this._messages.length && !compact;
    const newChat = fresh
      ? `<button class="hbtn" data-action="new" title="${esc(this._t("new_chat"))}" aria-label="${esc(this._t("new_chat"))}">${svgIcon(ICONS.new_chat)}</button>`
      : "";
    const pill = `<span class="pill ${cls}" role="status" title="${esc(text)}" aria-label="${esc(text)}"><span class="dot"></span><span class="pill-text">${esc(text)}</span></span>`;
    const name = `<div class="name">${esc(this._config.title || this._t("default_title"))}</div>`;
    if (this._illustrated()) {
      const night = isNight(this._hass, this._config) ? " night" : "";
      const buttons = newChat + this._zoomButton();
      return `<div class="banner ${cls}${night}${buttons ? " has-btns" : ""}${newChat && this._zoomButton() ? " btns-2" : ""}">${assistScene(this._uid, SCENE_STATES[key] || "idle")}
        <div class="htext">${this._badge(cls)}<div class="titles"><div class="tline">${name}${pill}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div></div>
        ${buttons ? `<div class="hbtns">${buttons}</div>` : ""}
      </div>`;
    }
    return `<div class="header">
        ${this._badge(cls)}
        <div class="titles">
          <div class="tline">${name}${pill}</div>
          ${sub ? `<div class="sub">${sub}</div>` : ""}
        </div>
        ${newChat}${this._zoomButton()}
      </div>`;
  }

  _zoomButton() {
    return "";
  }

  _message(m) {
    if (m.role === "user") return `<div class="msg user"><div class="bubble">${esc(m.text)}</div></div>`;
    if (m.role === "error") return `<div class="msg error"><div class="bubble">${svgIcon(ICONS.alert)}<span>${esc(m.text)}</span></div></div>`;
    const tools = m.tools?.length
      ? `<div class="tools" title="${esc(this._t("tools_used"))}">${m.tools.map((n) => `<span class="tool">${svgIcon(ICONS.wrench)}${esc(n)}</span>`).join("")}</div>`
      : "";
    const body = m.text ? `<div class="bubble md${m.streaming ? " streaming" : ""}">${md(m.text)}</div>` : "";
    return `<div class="msg assistant">${tools}${body}</div>`;
  }

  // The dots while an answer is awaited (before its first streamed word).
  _typing() {
    if (!this._busy || this._messages.some((m) => m.run === this._run && m.role === "assistant" && m.streaming && m.text)) return "";
    return `<div class="msg assistant"><div class="bubble typing" aria-label="${esc(this._t("status_thinking"))}"><span></span><span></span><span></span></div></div>`;
  }

  _chips() {
    const list = suggestionsOf(this._hass, this._config);
    if (!list.length) return "";
    return `<div class="chips">${list.map((s) => `<button class="chip" data-action="suggest" data-text="${esc(s)}" title="${esc(s)}">${esc(s)}</button>`).join("")}</div>`;
  }

  _placeholder() {
    const area = areaName(this._hass, this._config);
    return area ? this._t("placeholder_area", { area }) : this._t("placeholder");
  }

  // The microphone button: `big` in the mini card's voice view; disabled while a request is in progress.
  _micButton(big = false) {
    const listening = this._voice === "listening";
    const label = this._t(listening ? "mic_stop" : "mic_start");
    const off = !!this._problem() || this._busy || this._voice === "transcribing";
    return `<button class="ibtn mic${big ? " big" : ""}${listening ? " on" : ""}" data-action="mic" title="${esc(label)}" aria-label="${esc(label)}" aria-pressed="${listening}"${
      off ? " disabled" : ""
    }>${svgIcon(listening ? ICONS.stop : ICONS.mic)}</button>`;
  }

  // Text field and one round button: the microphone while the field is empty (when the pipeline has speech-to-text
  // and the browser a microphone), else send; listening, it stops the recording.
  _inputBar() {
    const blocked = !!this._problem();
    const ph = this._placeholder();
    const voice = this._micAvailable() && (this._voice || !this._hasText);
    const can = !!this._hasText && !this._busy && !this._voice && !blocked;
    const send = `<button class="ibtn send" data-action="send" title="${esc(this._t("send"))}" aria-label="${esc(this._t("send"))}"${can ? "" : " disabled"}>${svgIcon(ICONS.send)}</button>`;
    return `<div class="inputbar">
        <input class="text" type="text" enterkeyhint="send" autocomplete="off" placeholder="${esc(ph)}" aria-label="${esc(ph)}"${blocked ? " disabled" : ""}>
        ${voice ? this._micButton() : send}
      </div>`;
  }

  _style() {
    const h = Math.max(160, Math.min(1200, Math.round(Number(this._config.height) || DEFAULTS.height)));
    return `<style>${BASE_STYLE}${FULL_STYLE}${this._bannerStyle()}:host { --ac-height: ${h}px; }</style>`;
  }

  // The illustration's styles, only when it is shown.
  _bannerStyle() {
    return this._illustrated() ? BANNER_STYLE + SCENE_STYLE : "";
  }

  _render() {
    const problem = this._problem();
    const empty = this._messages.length
      ? ""
      : `<div class="empty"><div class="big">${svgIcon(ICONS.bot)}</div><div class="t">${esc(this._t("empty_title"))}</div>
          <div class="h">${esc(this._t(this._micAvailable() ? "empty_hint_voice" : "empty_hint"))}</div></div>`;
    const chips = this._chips();
    return `${this._style()}
      <ha-card>
        ${this._header(this._subtitle())}
        <div class="chat" role="log" aria-live="polite">${problem ? `<div class="warning">${esc(problem)}</div>` : ""}${empty}${this._messages.map((m) => this._message(m)).join("")}${this._typing()}</div>
        ${chips ? `<div class="suggest">${chips}</div>` : ""}
        ${this._inputBar()}
      </ha-card>`;
  }

  // ---- Interaction -----------------------------------------------------------

  _onClick(ev) {
    const el = ev.composedPath().find((n) => n.dataset?.action);
    if (!el) return;
    ev.stopPropagation();
    const action = el.dataset.action;
    if (action === "send") this._sendInput();
    else if (action === "suggest") this._send(el.dataset.text, { raw: true });
    else if (action === "mic") this._toggleMic();
    else if (action === "new") this._newConversation(true);
    else if (action === "zoom") this._toggleZoom(ev);
    else if (action === "more") this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: el.dataset.entity }, bubbles: true, composed: true }));
  }

  _onKey(ev) {
    if (ev.key === "Enter" && ev.target?.classList?.contains("text") && !ev.isComposing) {
      ev.preventDefault();
      this._sendInput();
      return;
    }
    if ((ev.key === "Enter" || ev.key === " ") && ev.target?.getAttribute?.("role") === "button") {
      ev.preventDefault();
      ev.target.click();
    }
  }

  _sendInput() {
    const input = this.shadowRoot.querySelector(".text");
    const text = input?.value ?? "";
    if (!text.trim() || this._busy || this._voice) return;
    input.value = "";
    this._hasText = false;
    this._send(text);
  }

  _toggleZoom() {}

  _newConversation(render = false) {
    this._run++;
    this._cancelRun?.();
    if (this._voice) this._cancelVoice();
    this._stopAudio();
    this._messages = [];
    this._conversationId = null;
    this._busy = false;
    this._cur = null;
    this._stick = true;
    if (render) this._update();
  }

  // The request as the agent gets it: with its area for the AI agents (the built-in one matches set sentences).
  _withArea(text) {
    const area = areaName(this._hass, this._config);
    if (!area || this._config.area_context === false || isBuiltin(this._hass, this._agentId())) return text;
    return this._t("area_prefix", { area, text });
  }

  _error(text) {
    this._messages.push({ role: "error", text, run: this._run });
  }

  // Sends one request and shows its answer; resolves once it is in (or failed).
  async _send(text, { raw = false } = {}) {
    const q = String(text ?? "").trim();
    if (!q || this._busy || !this._hass || this._problem()) return;
    this._stopAudio();
    const run = ++this._run;
    this._messages.push({ role: "user", text: q, run });
    this._busy = true;
    this._stick = true;
    this._cur = null;
    this._update();
    const payload = raw ? q : this._withArea(q);
    try {
      if (this._config.agent_id) await this._viaAgent(payload, run);
      else await this._viaPipeline(payload, run);
    } catch (err) {
      if (run === this._run && !err?.cancelled) this._error(this._errorText(err));
    } finally {
      if (run === this._run) {
        this._busy = false;
        this._cur = null;
        // Streamed bubbles left empty (an agent that only called tools) are dropped; none stays "streaming".
        this._messages = this._messages.filter((m) => !(m.run === run && m.role === "assistant" && !m.text && !m.tools?.length));
        for (const m of this._messages) m.streaming = false;
        this._update();
      }
    }
  }

  _errorText(err) {
    const code = err?.code;
    if (code === "stt-no-text-recognized") return this._t("err_no_speech");
    if (code === "pipeline-not-found") return this._t("err_pipeline", { id: this._config.pipeline || "" });
    if (code === "timeout") return this._t("err_timeout");
    return this._t("err_generic", { message: errText(err) });
  }

  async _viaAgent(text, run) {
    const msg = { type: "conversation/process", text, agent_id: this._config.agent_id };
    if (this._conversationId) msg.conversation_id = this._conversationId;
    const result = await this._hass.callWS(msg);
    if (run !== this._run) return;
    const speech = this._answer(result, run);
    if (speech && this._config.speak) this._speakText(speech, run);
  }

  async _viaPipeline(text, run) {
    const p = this._pipeline();
    const tts = !!this._config.speak && (p === undefined || !!p?.tts_engine);
    const msg = { start_stage: "intent", end_stage: tts ? "tts" : "intent", input: { text }, ...this._pipelineArg() };
    if (this._conversationId) msg.conversation_id = this._conversationId;
    await this._runPipeline(msg, (ev) => this._onEvent(ev, run));
  }

  // One assist_pipeline/run subscription: every event goes to `onEvent`; resolves at run-end, rejects on an
  // error event (with its code), a failed subscription or after RUN_TIMEOUT_MS.
  _runPipeline(msg, onEvent) {
    const conn = this._hass.connection;
    return new Promise((resolve, reject) => {
      let done = false;
      let unsub = null;
      const finish = (err) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (this._cancelRun === cancel) this._cancelRun = null;
        Promise.resolve(unsub)
          .then((u) => typeof u === "function" && u())
          .catch(() => {});
        if (err) reject(err);
        else resolve();
      };
      const cancel = () => finish(Object.assign(new Error("cancelled"), { cancelled: true }));
      const timer = setTimeout(() => finish(Object.assign(new Error(this._t("err_timeout")), { code: "timeout" })), RUN_TIMEOUT_MS);
      this._cancelRun = cancel;
      if (!conn?.subscribeMessage) {
        finish(new Error("no websocket connection"));
        return;
      }
      try {
        unsub = conn.subscribeMessage(
          (ev) => {
            if (done) return;
            try {
              onEvent(ev);
            } catch (err) {
              console.warn("assist-card:", err);
            }
            if (ev?.type === "run-end") finish();
            else if (ev?.type === "error") finish(Object.assign(new Error(ev.data?.message || ev.data?.code || "error"), { code: ev.data?.code }));
          },
          { type: "assist_pipeline/run", ...msg },
        );
        Promise.resolve(unsub).catch((err) => finish(err));
      } catch (err) {
        finish(err);
      }
    });
  }

  // The events of a text run: streamed deltas, the final answer and the speech.
  _onEvent(ev, run) {
    if (run !== this._run) return;
    const d = ev?.data || {};
    if (ev.type === "intent-progress" && d.chat_log_delta) {
      const delta = d.chat_log_delta;
      // A new assistant message (after a tool result) gets its own bubble.
      if (delta.role) this._cur = null;
      const names = (delta.tool_calls || []).map((c) => c?.tool_name || c?.name).filter(Boolean);
      if (!delta.content && !names.length) return;
      if (!this._cur) {
        this._cur = { role: "assistant", text: "", tools: [], streaming: true, run };
        this._messages.push(this._cur);
      }
      if (delta.content) this._cur.text += delta.content;
      for (const n of names) if (!this._cur.tools.includes(n)) this._cur.tools.push(n);
      this._scheduleUpdate();
    } else if (ev.type === "intent-end") {
      this._answer(d.intent_output || {}, run);
      this._update();
    } else if (ev.type === "tts-end" && d.tts_output?.url) {
      this._play(d.tts_output.url);
    }
  }

  // Many deltas a second: one render per frame.
  _scheduleUpdate() {
    if (this._pending) return;
    this._pending = true;
    const later = globalThis.requestAnimationFrame || ((fn) => setTimeout(fn, 16));
    later(() => {
      this._pending = false;
      this._update();
    });
  }

  // The final answer of a run (conversation/process result or intent output); returns its speech.
  _answer(output, run) {
    if (output?.conversation_id) this._conversationId = output.conversation_id;
    const resp = output?.response || {};
    const speech = speechOf(resp).trim();
    const mine = this._messages.filter((m) => m.run === run && m.role === "assistant");
    if (resp.response_type === "error") {
      this._messages = this._messages.filter((m) => !(m.run === run && m.role === "assistant" && !m.tools?.length));
      this._error(speech || this._t("err_generic", { message: resp.data?.code || "?" }));
      return "";
    }
    // The streamed bubble (or one that only shows tools) takes the final text; else the answer gets its own.
    const last = mine.at(-1);
    if (last && (last === this._cur || !last.text)) {
      if (speech) last.text = speech;
      else if (!last.text && !last.tools?.length) last.text = this._t("err_empty");
    } else if (!last || (speech && last.text.trim() !== speech)) {
      this._messages.push({ role: "assistant", text: speech || this._t("err_empty"), tools: [], run });
    }
    for (const m of mine) m.streaming = false;
    this._cur = null;
    return speech;
  }

  // ---- Speech --------------------------------------------------------------------

  _play(url) {
    this._stopAudio();
    let audio;
    try {
      audio = new Audio(typeof this._hass.hassUrl === "function" ? this._hass.hassUrl(url) : url);
    } catch (_err) {
      return;
    }
    this._audio = audio;
    this._speaking = true;
    const end = () => {
      if (this._audio !== audio) return;
      this._audio = null;
      this._speaking = false;
      this._update();
    };
    audio.addEventListener?.("ended", end);
    audio.addEventListener?.("error", end);
    Promise.resolve(audio.play?.()).catch(end);
    this._update();
  }

  _stopAudio() {
    const a = this._audio;
    this._audio = null;
    if (a) {
      try {
        a.pause();
      } catch (_err) {
        /* already stopped */
      }
    }
    if (this._speaking) {
      this._speaking = false;
      this._update();
    }
  }

  // An agent's answer read by the pipeline's text-to-speech (conversation/process has no speech of its own).
  _speakText(text, run) {
    const p = this._pipeline();
    if (p && !p.tts_engine) return;
    this._runPipeline({ start_stage: "tts", end_stage: "tts", input: { text }, ...this._pipelineArg() }, (ev) => {
      if (run === this._run && ev.type === "tts-end" && ev.data?.tts_output?.url) this._play(ev.data.tts_output.url);
    }).catch((err) => console.warn("assist-card: speech failed:", errText(err)));
  }

  // ---- Voice input -----------------------------------------------------------------

  // Speech-to-text of the pipeline, its text then sent like a typed request (with its area, to the card's agent).
  async _toggleMic() {
    if (this._voice === "listening") {
      this._stopListening();
      return;
    }
    if (this._voice || this._busy || !this._micAvailable()) return;
    this._stopAudio();
    this._handler = null;
    const pending = [];
    const rec = new VoiceRecorder((chunk) => {
      if (this._handler === null) pending.push(chunk);
      else this._sendAudio(chunk);
    });
    this._recorder = rec;
    this._voice = "listening";
    this._update();
    try {
      await rec.start();
    } catch (err) {
      this._recorder = null;
      this._voice = null;
      this._error(this._t("err_mic", { message: errText(err) }));
      this._update();
      return;
    }
    if (this._voice !== "listening") {
      rec.stop();
      return;
    }
    this._listenTimer = setTimeout(() => this._stopListening(), LISTEN_MAX_MS);
    let text = "";
    let failed = null;
    try {
      await this._runPipeline({ start_stage: "stt", end_stage: "stt", input: { sample_rate: rec.sampleRate }, ...this._pipelineArg() }, (ev) => {
        if (ev.type === "run-start") {
          this._handler = ev.data?.runner_data?.stt_binary_handler_id ?? null;
          for (const c of pending.splice(0)) this._sendAudio(c);
          // Stopped before the pipeline was ready: the audio ends right away.
          if (this._voice !== "listening") this._sendAudio(null);
        } else if (ev.type === "stt-vad-end") this._stopListening();
        else if (ev.type === "stt-end") text = String(ev.data?.stt_output?.text ?? "");
      });
    } catch (err) {
      failed = err;
    } finally {
      clearTimeout(this._listenTimer);
      this._stopRecorder();
      this._handler = null;
    }
    if (failed?.cancelled) return;
    this._voice = null;
    if (failed) this._error(this._errorText(failed));
    else if (!text.trim()) this._error(this._t("err_no_speech"));
    this._update();
    if (!failed && text.trim()) this._send(text);
  }

  _stopRecorder() {
    this._recorder?.stop();
    this._recorder = null;
  }

  _stopListening() {
    if (this._voice !== "listening") return;
    clearTimeout(this._listenTimer);
    this._stopRecorder();
    this._voice = "transcribing";
    // An empty chunk ends the audio stream.
    if (this._handler !== null) this._sendAudio(null);
    this._update();
  }

  _cancelVoice() {
    clearTimeout(this._listenTimer);
    this._stopRecorder();
    this._voice = null;
    this._cancelRun?.();
  }

  // One binary websocket message: the handler id, then the 16-bit samples (none: end of the audio).
  _sendAudio(chunk) {
    const sock = this._hass?.connection?.socket;
    if (!sock || this._handler === null || this._handler === undefined) return;
    const bytes = chunk ? new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength) : new Uint8Array(0);
    const data = new Uint8Array(1 + bytes.length);
    data[0] = this._handler;
    data.set(bytes, 1);
    try {
      sock.send(data);
    } catch (err) {
      console.warn("assist-card: audio not sent:", errText(err));
    }
  }
}

// The mini card: one input line and the last answer; its detail button (top right, `zoom: false` removes it)
// unfolds the full chat, and a click anywhere else on the page folds it back.
class AssistMiniCard extends AssistCard {
  constructor() {
    super();
    this._unzoom = watchOutside(this, () => {
      if (this._zoomed) this._setZoom(false);
    });
  }

  static getConfigElement() {
    return document.createElement("assist-mini-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    // Back to the compact view once off the screen.
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = !!this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button class="hbtn zoom" data-action="zoom" title="${label}" aria-label="${label}" aria-pressed="${z}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    this._stick = true;
    this._update();
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
  }

  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev?.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  _render() {
    if (this._zoomed) return super._render();
    const problem = this._problem();
    const mic = this._micAvailable();
    const lastQ = [...this._messages].reverse().find((m) => m.role === "user");
    const lastA = [...this._messages].reverse().find((m) => m.role !== "user" && (m.text || m.role === "error"));
    let body;
    if (problem) body = `<div class="warning">${esc(problem)}</div>`;
    else if (!this._messages.length) body = `<div class="h">${esc(this._t(mic ? "empty_hint_voice" : "empty_hint"))}</div>`;
    else {
      const answer = this._typing() || (lastA && this._messages.indexOf(lastA) > this._messages.indexOf(lastQ) ? this._message(lastA) : "");
      body = `${lastQ ? `<div class="q" title="${esc(lastQ.text)}">${esc(lastQ.text)}</div>` : ""}${answer}`;
    }
    // Without a microphone (no speech-to-text in the pipeline, `voice: false`, no secure context) a text field instead.
    return `<style>${BASE_STYLE}${MINI_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._header("", true)}
        <div class="voice" aria-live="polite">${mic ? this._micButton(true) : ""}${body}${problem ? "" : this._chips()}</div>
        ${mic ? "" : this._inputBar()}
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

const HELPERS = { pipeline: "pipeline_helper", agent_id: "agent_helper", area: "area_helper", zoom: "zoom_helper" };

// Keeps the YAML minimal: drops empty values and options left at their default.
const cleanConfig = (value, defaults) => {
  const config = { ...value };
  for (const [k, v] of Object.entries(config)) {
    if (v === "" || v === undefined || v === null || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
  }
  return config;
};

class AssistCardEditor extends HTMLElement {
  // [name, default]
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_suggestions", true],
      ["area_context", true],
      ["voice", true],
      ["speak", false],
    ];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "pipeline", selector: { assist_pipeline: {} } },
      { name: "agent_id", selector: { conversation_agent: {} } },
      { name: "title", selector: { text: {} } },
      { name: "area", selector: { area: {} } },
      { type: "grid", name: "", schema: this.constructor.toggles.map(([name]) => ({ name, selector: { boolean: {} } })) },
      {
        name: "illustration_theme",
        selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } },
      },
      { name: "height", selector: { number: { min: 160, max: 1200, step: 10, mode: "box", unit_of_measurement: "px" } } },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    const defaults = { ...Object.fromEntries(toggles), ...DEFAULTS };
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => (HELPERS[s.name] ? t(this._hass, this._config, HELPERS[s.name]) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._config = cleanConfig(ev.detail.value, defaults);
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...defaults, ...this._config };
    this._form.hass = this._hass;
    if (this._dataDeps !== this._config) {
      this._dataDeps = this._config;
      this._form.data = data;
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

// The options of the full card, which its unfolded view uses, and the detail button.
class AssistMiniCardEditor extends AssistCardEditor {
  static get toggles() {
    return [...AssistCardEditor.toggles, ["zoom", true]];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("assist-card", AssistCard);
define("assist-mini-card", AssistMiniCard);
define("assist-card-editor", AssistCardEditor);
define("assist-mini-card-editor", AssistMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "assist-card",
    name: "Assist Card",
    description: "Chat with an Assist pipeline or any conversation agent: streamed answers, voice input, spoken answers and suggestions.",
  },
  { type: "assist-mini-card", name: "Assist Mini Card", description: "One input line and the last answer of Assist, unfolding to the full chat." },
]) {
  if (!window.customCards.some((c) => c.type === card.type)) window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-assist-card" });
}

console.info(`%c ASSIST-CARD %c ${VERSION} `, "color:#fff;background:#7e57c2;font-weight:700", "color:#7e57c2;background:transparent");
