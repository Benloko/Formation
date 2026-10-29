// Données officielles des formations interactives de Mr Ben

export const BOOKS_DATA = [
  {
    id: "livre-bd-storytelling",
    type: "bd",
    title: "L'Art du Storytelling & Bandes Dessinées avec l'IA",
    subtitle: "La méthode complète de Mr Ben pour créer des histoires captivantes",
    coverTag: "FORMATION 1",
    price: 2500,
    originalPrice: 5000,
    currency: "FCFA",
    badge: "Best-seller",
    description: "Apprenez pas à pas la méthode de Mr Ben pour concevoir des bandes dessinées captivantes et des histoires virales sur les réseaux sociaux.",
    freePreviewPages: 1, // Page 1 en lecture libre pour découvrir le résumé et la méthode
    chapters: [
      {
        id: "ch1",
        chapterNumber: 1,
        title: "Étape 1 : Le Scénario & Le Suspense",
        locked: false,
        pages: [
          {
            pageNumber: 1,
            title: "Vue d'ensemble : Ce que résume cette formation",
            heroImage: "/images/formation/lessons/bd_etape1_vue_ensemble.jpg",
            type: "intro",
            content: `### Bienvenue dans ma méthode de création

Aujourd'hui, des millions de personnes passent leur temps à faire défiler leur fil d'actualité sur Facebook, TikTok ou Instagram. Une simple belle image retient l'attention deux secondes, puis on l'oublie.

Ce qui fait la vraie différence, ce qui crée une communauté fidèle de milliers de personnes qui reviennent chaque soir attendre votre publication, c'est **l'art de raconter une histoire**.

Dans cette formation, je ne vais pas simplement vous montrer comment taper du texte dans une intelligence artificielle. Je vais vous transmettre ma méthode complète pour transformer vos idées en véritables feuilletons visuels, épisode par épisode, avec des personnages attachants et un suspense qui captive.

#### Ce que vous allez maîtriser pas à pas :

Cette formation est construite comme un parcours progressif en 4 étapes indispensables :

* **Étape 1 : Le Scénario & Le Suspense** — Comment trouver une idée forte, la découper en épisodes courts et maîtriser l'art du cliffhanger pour déclencher des centaines de commentaires.
* **Étape 2 : L'Art du Master Prompt & La Cohérence des Personnages** — Comment apprêter ChatGPT avec notre exemplaire de référence pour générer des prompts longs et somptueux, et verrouiller l'ADN visuel de vos héros pour garder les mêmes visages sur toute la série.
* **Étape 3 : L'Incrustation des Textes & Bulles de Dialogue** — La méthode pour ajouter des bulles de discussion soignées et professionnelles sans masquer les expressions ni gâcher l'image.
* **Étape 4 : La Stratégie de Publication & Croissance sur les Réseaux** — Rythme de 2 à 4 publications par jour, animation active de votre communauté et le tremplin des vidéos IA pour faire exploser vos abonnés.

Vous n'avez pas besoin de savoir dessiner, ni d'avoir un ordinateur sophistiqué. Avec un simple téléphone et de la méthode, vous avez entre les mains tout ce qu'il faut pour commencer.`,
            tip: "Prenez le temps d'assimiler chaque étape dans l'ordre. La qualité d'une image commence toujours par la clarté de l'histoire dans votre tête."
          },
          {
            pageNumber: 2,
            title: "1.1 Trouver une histoire qui captive votre audience",
            heroImage: "/images/formation/lessons/bd_etape1_vue_ensemble.jpg",
            type: "step",
            content: `### Où trouver des idées qui touchent vraiment les gens ?

Beaucoup de débutants se bloquent en pensant qu'il faut inventer des histoires de science-fiction compliquées ou des scénarios de films hollywoodiens. C'est une erreur fréquente.

Les histoires qui fonctionnent le mieux sur les réseaux sociaux sont celles qui s'inspirent directement de la vie réelle et des émotions humaines : les histoires de famille, les relations de voisinage, les secrets inavoués, les rivalités, les amours difficiles ou les dilemmes du quotidien.

Quand un lecteur découvre votre première planche et se dit intérieurement : *« Mais attends, ça me rappelle quelque chose que j'ai déjà vécu »* ou *« Je connais quelqu'un dans cette situation »*, vous avez gagné son attention.

#### Comment amorcer votre intrigue ?
Une bonne histoire repose toujours sur trois ingrédients simples au départ :

* **Un personnage central attachant** auquel le public peut s'identifier facilement.
* **Un désir ou un problème immédiat** : le personnage cherche à résoudre une situation, cache un secret ou attend une nouvelle importante.
* **Un obstacle ou un imprévu** : quelque chose vient troubler sa tranquillité (une visite inattendue, un coup de fil suspect, une révélation).

Dès que cet imprévu apparaît, l'histoire est lancée. Vous n'avez pas besoin de tout dévoiler dès le départ : il suffit de poser la première graine de curiosité.`,
            tip: "Notez toujours les anecdotes et situations insolites de la vie de tous les jours dans le bloc-notes de votre téléphone. Ce sont les meilleures matières premières pour vos scénarios."
          },
          {
            pageNumber: 3,
            title: "1.2 Les 3 piliers indispensables d'un épisode réussi",
            heroImage: "/images/formation/lessons/bd_etape1_vue_ensemble.jpg",
            type: "step",
            content: `### Comment concevoir une planche qui frappe l'œil ?

Lorsque vous créez un épisode, votre image ne doit pas être une simple illustration décorative. Elle doit porter l'intensité dramatique de la scène.

Pour qu'un épisode soit réussi et retienne instantanément le regard, je m'assure toujours de réunir trois piliers fondamentaux :

#### 1. Le Décor et l'Ambiance Visuelle
L'arrière-plan pose immédiatement l'atmosphère. Que votre scène se passe dans une cour de maison le soir, dans un salon fermé ou sous un lampadaire dans une ruelle sombre, l'éclairage et les ombres doivent donner le ton. La lumière raconte la solitude, la tension ou l'intimité avant même qu'un mot ne soit prononcé.

#### 2. L'Émotion et la Vérité des Regards
C'est le point le plus important : les visages de vos personnages doivent exprimer une émotion sincère et naturelle. Un regard surpris, une hésitation, un sourire timide ou un froncement de sourcils discret. L'intelligence artificielle a tendance à figer les personnages comme des mannequins si on ne lui demande pas explicitement des expressions humaines et nuancées.

#### 3. La Question en Suspens
Chaque épisode doit apporter un petit détail tout en laissant une porte ouverte. Ne donnez jamais la solution complète dans la même image. Votre scène doit s'arrêter pile au moment où le lecteur a envie de savoir ce qui va se passer la seconde suivante.`,
            checklist: [
              "Le décor situe clairement l'ambiance et le moment de la journée",
              "Les expressions des personnages traduisent une émotion compréhensible sans le texte",
              "La scène se termine sur un instant d'attente qui donne envie de voir la suite"
            ]
          },
          {
            pageNumber: 4,
            title: "1.3 La méthode du ralenti narratif pour tenir sur la durée",
            heroImage: "/images/formation/lessons/bd_etape1_vue_ensemble.jpg",
            type: "strategy",
            content: `### Le secret pour créer des feuilletons de 50 ou 100 épisodes

L'erreur numéro un de ceux qui se lancent, c'est de vouloir tout raconter trop vite. Au bout de trois publications, le secret est révélé, le personnage a trouvé sa réponse, et l'histoire est finie. Résultat : l'audience se disperse.

Pour construire une communauté qui vous suit fidèlement semaine après semaine, il faut apprendre **l'art du ralenti narratif**.

#### Qu'est-ce que le ralenti narratif ?
Le ralenti narratif consiste à étirer un moment clé dans le temps en le décomposant en plusieurs étapes émotionnelles. Une discussion qui ne dure que cinq minutes dans la vraie vie peut facilement devenir la matière de trois ou quatre épisodes captivants :

* **Premier épisode** : L'arrivée inattendue d'une personne à la porte. L'échange de regards surpris et le trouble de la rencontre.
* **Deuxième épisode** : Les premières paroles hésitantes et la révélation d'un premier indice mystérieux.
* **Troisième épisode** : Une réaction inattendue ou un bruit soudain qui interrompt la discussion avant la conclusion.

En procédant ainsi, vous donnez à chaque épisode le temps de respirer et de créer une vraie tension. Votre communauté a le temps de spéculer, de débattre et d'imaginer la suite.`,
            tip: "Pensez comme un réalisateur de série télévisée : ce qui passionne le spectateur, ce n'est pas seulement la fin, c'est le suspense de l'attente."
          },
          {
            pageNumber: 5,
            title: "1.4 L'art du cliffhanger et le secret de l'engagement",
            heroImage: "/images/formation/lessons/bd_etape1_vue_ensemble.jpg",
            type: "strategy",
            content: `### Transformer vos lecteurs en commentateurs passionnés

Sur les réseaux sociaux comme Facebook et TikTok, les algorithmes favorisent énormément les publications qui génèrent des conversations. Plus les gens écrivent sous votre publication, plus votre contenu est présenté à de nouveaux abonnés gratuitement.

Le texte qui accompagne votre image ne doit donc pas être une simple description plate. Il doit se terminer par un **cliffhanger**, c'est-à-dire une phrase qui pousse les lecteurs à réagir immédiatement.

#### Les 3 types de questions qui déclenchent les commentaires :

* **Le Dilemme Moral** : Posez une question qui divise l'opinion de manière bienveillante. Par exemple : *« Si vous étiez à sa place, auriez-vous ouvert la porte à cette heure-là ? Donnez votre avis sincère. »*
* **La Théorie ou l'Intuition** : Invitez votre audience à faire des suppositions sur la suite des événements : *« D'après vous, pourquoi cette personne hésite-t-elle à parler ? Les meilleures théories en commentaire ! »*
* **Le Rendez-vous Programmé** : Fixez une heure de rendez-vous pour la suite pour créer l'habitude chez vos abonnés : *« La suite arrive demain à 20h pile. Activez vos notifications pour ne rien manquer ! »*

En créant cette complicité avec vos lecteurs, vous ne faites pas que publier des images : vous animez un véritable rendez-vous quotidien avec votre communauté.`,
            tip: "Pendant les 15 premières minutes qui suivent votre publication, prenez le temps de répondre aux premiers commentaires. Cela envoie un signal puissant à l'algorithme qui comprend que votre contenu suscite un vif intérêt."
          }
        ]
      },
      {
        id: "ch2",
        chapterNumber: 2,
        title: "Étape 2 : L'Art du Master Prompt & La Cohérence des Personnages",
        locked: false,
        pages: [
          {
            pageNumber: 6,
            title: "2.1 Le Duo Indispensable : ChatGPT l'Architecte & Gemini le Peintre",
            heroImage: "/images/formation/lessons/bd_etape2_master_prompt.jpg",
            type: "step",
            content: `### Ne confondez jamais l'outil qui rédige et l'outil qui peint

Beaucoup de débutants commettent l'erreur de tout demander au même endroit, ou de penser qu'une seule IA peut tout faire par magie. 

Dans la méthode officielle de Mr Ben, nous utilisons un **duo d'outils complémentaires** et chacun a un rôle strictly défini :

* **ChatGPT (L'Architecte du Prompt)** : C'est l'IA avec laquelle vous dialoguez. Elle sert **exclusivement** à comprendre votre histoire, traduire vos intentions en langage cinématographique et rédiger des Master Prompts longs, structurés et ultra-détaillés en anglais.
* **Gemini (Le Peintre & Générateur Officiel)** : C'est l'outil dans lequel vous collez le prompt obtenu. **C'est toujours Gemini que nous utilisons pour générer les images réelles**. Pourquoi Gemini ? Parce qu'il excelle de façon spectaculaire dans le rendu des peaux africaines, le contraste des lumières de nuit et la douceur des peintures numériques stylisées sans défauts anatomiques.

#### Pourquoi les prompts courts de deux lignes échouent-ils ?

L'erreur la plus courante consiste à taper des phrases courtes comme : *« Un bel homme et une femme qui parlent la nuit dans une maison »*.

Lorsque vous donnez une consigne aussi courte :
* L'IA comble le vide par défaut avec des visages génériques sans émotion.
* Le décor est flou, sans âme et sans contexte local.
* La lumière est plate et sans ambiance dramatique.

#### L'exigence d'un Master Prompt long et cinématographique

Pour créer des images magnifiques qui déclenchent un véritable choc visuel chez votre audience, **votre prompt doit être long, dense et structuré en plusieurs paragraphes**.

Il doit préciser le style artistique, la focale de la caméra, la position exacte des personnages, leurs tenues, les nuances de lumière et l'atmosphère intime. C'est cette richesse de description qui pousse Gemini à produire des visuels dignes d'une grande production Netflix africaine.`,
            tip: "Retenez cette règle d'or : vous préparez et peaufinez toujours votre prompt dans ChatGPT, puis vous le copiez et le collez dans Gemini pour faire naître l'image."
          },
          {
            pageNumber: 7,
            title: "2.2 Apprêter le Fil de Discussion & Verrouiller l'ADN des Personnages",
            heroImage: "/images/formation/lessons/bd_etape2_master_prompt.jpg",
            type: "step",
            content: `### Comment cadrer l'IA pour qu'elle produise des merveilles sans s'égarer

Avant d'écrire le moindre épisode, il existe une règle indispensable : **on doit impérativement apprêter le fil de discussion dans ChatGPT dès le tout premier message**.

Si vous arrivez dans ChatGPT et que vous lui lancez votre première scène directement, il va s'embrouiller : il va inventer des pavés de texte, tenter de générer une image tout seul dans le chat, ou vous sortir un petit résumé plat.

#### 1. Le message de cadrage initial avec notre Exemplaire Officiel

Vous ouvrez un fil de discussion vierge dans ChatGPT et vous envoyez ce message complet. Remarquez que nous y collons directement notre **Exemplaire Officiel de Référence** pour lui imposer le standard obligatoire :

\`\`\`text
Bonjour. Nous allons concevoir ensemble un feuilleton visuel africain par épisodes.
Ton rôle unique dans cette discussion est d'être mon assistant réalisateur et expert en prompts cinématographiques.

Règles que tu dois respecter strictement :
1. Ne cherche JAMAIS à générer d'images directement dans le chat.
2. Ne rédige pas de dialogues ni de longs récits inutiles.
3. À chaque scène que je te décrirai, ton travail est UNIQUEMENT de me fournir un Master Prompt en anglais, ultra détaillé, long, structuré en plusieurs paragraphes et prêt à copier pour mon générateur d'images Gemini.
4. Tu dois t'assurer que le rendu final soit absolument magnifique, élégant, cinématographique et digne d'un drama africain premium Netflix.

Voici l'exemplaire officiel de référence que tu dois suivre comme modèle absolu de structure, de style et de niveau de détail pour chaque scène :

---
Ultra realistic African digital painting style, extremely soft stylized rendering, beautiful cinematic Netflix-style African drama, 1:1 square composition, exceptionally beautiful characters, elegant intimate nighttime atmosphere.

A beautiful quiet night inside a modest shared rental compound in Abomey-Calavi, Benin. Ariel is standing just inside his small studio room while his beautiful adult female neighbor has come to speak with him late at night. The wooden door is slightly ajar, only partially open, creating a soft and intimate visual separation between the warmly lit interior and the quiet outdoor walkway.

Professional cinematic medium-wide composition, camera approximately 3 meters in front of them at eye level, positioned outside the doorway so both characters are beautifully framed together. The slightly open door is clearly visible, with Ariel naturally standing just inside and the neighbor standing immediately outside, facing him.

Ariel, 21 years old, extraordinarily handsome, with exceptionally refined youthful facial features, charming slightly green eyes, smooth luminous skin, short simple perfectly groomed black hair and a naturally attractive masculine appearance. He is wearing only clean simple white shorts, standing naturally inside his room. His posture is relaxed and casual, while his expression is calm and slightly surprised, as though he did not expect his beautiful neighbor to come talk to him at night.

The neighbor is a stunning adult African woman with a warm sun-kissed bronzed complexion, exceptionally beautiful facial features, a delicate nose piercing and very long elegant blue braids cascading beautifully down her back. She has a graceful feminine silhouette and an effortlessly attractive presence. She wears a stylish sexy fitted black mini-skirt and a clean fitted white sleeveless tank top, creating a striking black-and-white nighttime outfit. Delicate ankle chains remain visible. She stands naturally just outside Ariel’s slightly open door, speaking to him with a soft friendly smile and relaxed confident body language.

The interaction should feel natural and subtle: the neighbor has simply come to talk to Ariel, while Ariel listens attentively. Their faces and expressions remain the emotional focus of the scene. No exaggerated poses; both characters should look naturally comfortable and beautiful.

The shared rental compound is clean, modest and realistic, with several aligned studio entrances, warm cream-colored walls, a neat paved walkway and a small carefully trimmed green lawn. Soft exterior lights illuminate the walkway while the warm light from Ariel’s room gently escapes through the partially open door. The dark blue night sky and soft surrounding shadows create a beautiful cinematic contrast.

Soft luminous nighttime lighting, warm gentle interior light mixed with subtle cool night ambience, beautiful natural highlights on their faces and hair, realistic skin texture, detailed blue braids, delicate fabric textures, natural shadows, refined depth of field and sophisticated cinematic color grading.

The image must be exceptionally beautiful, soft, clean, polished and artistic. Both characters must look extraordinarily attractive, with flawless but realistic facial features, natural proportions, elegant posture and highly detailed skin and hair. The overall feeling should be romantic, calm, visually captivating and sophisticated, like a beautiful scene from a premium African Netflix drama.

No nudity, no explicit sexual activity, no exaggerated poses, no distorted anatomy, no distorted hands, no artificial yellow tint, no excessive saturation, no clutter, no comic-book effect.

Ultra-detailed African digital painting, extremely soft stylized rendering, extraordinarily handsome Ariel in clean white shorts standing inside his slightly open doorway, exceptionally beautiful adult neighbor in a sexy fitted black mini-skirt and fitted white sleeveless tank top, very long blue braids, warm bronzed complexion, elegant ankle chains, beautiful nighttime rental compound, soft warm doorway light, delicate cinematic shadows, exceptionally beautiful characters, premium Netflix-style African drama aesthetic, pristine 8K quality.
---

As-tu bien compris ta mission et le niveau d'exigence ?
\`\`\`

ChatGPT vous répond alors : *« Parfaitement compris ! Je suis votre directeur artistique. Je respecterai scrupuleusement la structure longue, le style de peinture numérique africaine douce et le niveau d'excellence de votre exemplaire. Décrivez-moi votre première scène. »*

#### 2. Le secret pour garder les mêmes visages sur toute la série

En injectant cet exemplaire dès le départ, vous verrouillez **l'ADN Visuel Fixe** de vos héros :
* **Ariel** : 21 ans, traits raffinés, yeux légèrement verts, peau lumineuse et courte coupe noire soignée.
* **La voisine** : teint bronzé, piercing délicat au nez, très longues tresses bleues caractéristiques, débardeur blanc et mini-jupe noire.

Dans chaque scène suivante, ChatGPT reprend automatiquement ces balises physiques précises. C'est ce qui garantit que vos personnages gardent strictement le même visage tout au long du feuilleton !`,
            checklist: [
              "Le fil de discussion a été cadré dès le départ avec le rôle fixe de ChatGPT",
              "L'exemplaire officiel de référence a été injecté dans le tout premier message",
              "L'ADN visuel fixe des personnages (yeux, traits, coiffure signature) est verrouillé",
              "La règle est posée : ChatGPT rédige le prompt long, et Gemini génère l'image finale"
            ]
          },
          {
            pageNumber: 8,
            title: "2.3 Cas Pratique : Les 3 Scènes Enchaînées avec l'Exemplaire Officiel",
            heroImage: "/images/formation/lessons/bd_etape2_master_prompt.jpg",
            type: "step",
            content: `### Du dialogue dans ChatGPT à la génération dans Gemini

Mettons en pratique cette méthode complète en créant **les 3 premières scènes d'un feuilleton**, dans un seul et même fil de discussion, avec nos deux personnages vedettes : **Ariel** et sa belle voisine dans une concession à Abomey-Calavi (Bénin).

---

### Scène 1 : La Rencontre Nocturne à la Porte Entrouverte

#### 1. Ce que vous envoyez à ChatGPT dans la discussion :

\`\`\`text
Scène 1 : C'est une belle nuit calme dans une cour commune modeste à Abomey-Calavi au Bénin. Ariel (21 ans), très séduisant, en short blanc simple, est à l'intérieur de sa chambre studio. Sa voisine, une magnifique femme africaine avec de longues tresses bleues, un débardeur blanc et une mini-jupe noire ajustée, est venue lui parler tard dans la nuit. La porte en bois est entrouverte, créant une séparation intime. Lumière chaude de la chambre, ciel nocturne bleu. Rédige le Master Prompt complet en suivant notre exemplaire officiel.
\`\`\`

#### 2. L'échange en situation réelle dans ChatGPT :

Voici exactement ce qui apparaît sur votre écran : votre description envoyée en haut, et la réponse de ChatGPT avec le bloc de prompt et son bouton de copie :

![Capture réelle de l'échange dans ChatGPT — La consigne envoyée et le Master Prompt généré avec le bouton 'Copy code' encadré](/images/formation/chatgpt-ariel-scene-exchange.jpg)

* 🟢 **Votre message** : Vous décrivez la scène simplement avec vos mots.
* 🟢 **La réponse de ChatGPT** : Il enrichit la scène et formule le Master Prompt cinématique officiel en anglais.
* 🟢 **Le bouton de copie (Icône double carré)** : Encadré en rouge en haut à droite du bloc de code, il vous permet de copier l'intégralité du texte en un seul clic !

#### 3. Le Master Prompt Officiel 1 généré (À copier) :

\`\`\`text
Ultra realistic African digital painting style, extremely soft stylized rendering, beautiful cinematic Netflix-style African drama, 1:1 square composition, exceptionally beautiful characters, elegant intimate nighttime atmosphere.

A beautiful quiet night inside a modest shared rental compound in Abomey-Calavi, Benin. Ariel is standing just inside his small studio room while his beautiful adult female neighbor has come to speak with him late at night. The wooden door is slightly ajar, only partially open, creating a soft and intimate visual separation between the warmly lit interior and the quiet outdoor walkway.

Professional cinematic medium-wide composition, camera approximately 3 meters in front of them at eye level, positioned outside the doorway so both characters are beautifully framed together. The slightly open door is clearly visible, with Ariel naturally standing just inside and the neighbor standing immediately outside, facing him.

Ariel, 21 years old, extraordinarily handsome, with exceptionally refined youthful facial features, charming slightly green eyes, smooth luminous skin, short simple perfectly groomed black hair and a naturally attractive masculine appearance. He is wearing only clean simple white shorts, standing naturally inside his room. His posture is relaxed and casual, while his expression is calm and slightly surprised, as though he did not expect his beautiful neighbor to come talk to him at night.

The neighbor is a stunning adult African woman with a warm sun-kissed bronzed complexion, exceptionally beautiful facial features, a delicate nose piercing and very long elegant blue braids cascading beautifully down her back. She has a graceful feminine silhouette and an effortlessly attractive presence. She wears a stylish sexy fitted black mini-skirt and a clean fitted white sleeveless tank top, creating a striking black-and-white nighttime outfit. Delicate ankle chains remain visible. She stands naturally just outside Ariel’s slightly open door, speaking to him with a soft friendly smile and relaxed confident body language.

The interaction should feel natural and subtle: the neighbor has simply come to talk to Ariel, while Ariel listens attentively. Their faces and expressions remain the emotional focus of the scene. No exaggerated poses; both characters should look naturally comfortable and beautiful.

The shared rental compound is clean, modest and realistic, with several aligned studio entrances, warm cream-colored walls, a neat paved walkway and a small carefully trimmed green lawn. Soft exterior lights illuminate the walkway while the warm light from Ariel’s room gently escapes through the partially open door. The dark blue night sky and soft surrounding shadows create a beautiful cinematic contrast.

Soft luminous nighttime lighting, warm gentle interior light mixed with subtle cool night ambience, beautiful natural highlights on their faces and hair, realistic skin texture, detailed blue braids, delicate fabric textures, natural shadows, refined depth of field and sophisticated cinematic color grading.

The image must be exceptionally beautiful, soft, clean, polished and artistic. Both characters must look extraordinarily attractive, with flawless but realistic facial features, natural proportions, elegant posture and highly detailed skin and hair. The overall feeling should be romantic, calm, visually captivating and sophisticated, like a beautiful scene from a premium African Netflix drama.

No nudity, no explicit sexual activity, no exaggerated poses, no distorted anatomy, no distorted hands, no artificial yellow tint, no excessive saturation, no clutter, no comic-book effect.

Ultra-detailed African digital painting, extremely soft stylized rendering, extraordinarily handsome Ariel in clean white shorts standing inside his slightly open doorway, exceptionally beautiful adult neighbor in a sexy fitted black mini-skirt and fitted white sleeveless tank top, very long blue braids, warm bronzed complexion, elegant ankle chains, beautiful nighttime rental compound, soft warm doorway light, delicate cinematic shadows, exceptionally beautiful characters, premium Netflix-style African drama aesthetic, pristine 8K quality.
\`\`\`

#### 4. Vous collez ce prompt dans Gemini : voici le résultat obtenu !

On ouvre **Gemini**, on colle le Master Prompt copié, et Gemini génère instantanément cette première planche :

![Scène 1 : Ariel et sa voisine aux tresses bleues à la porte entrouverte à Calavi](/images/formation/ariel-voisine-scene-1.jpg)

---

### Scène 2 : La Suite dans la Même Discussion (L'Intimité du Studio)

Vous ne créez **pas** de nouvelle discussion. Vous restez dans le même fil ChatGPT et vous demandez la suite :

#### Ce que vous écrivez à ChatGPT :

\`\`\`text
Superbe ! On passe à la suite immédiate : Ariel a invité sa voisine à entrer pour continuer la discussion. Ariel est assis sur le bord de son lit en bois, vêtu de ses shorts blancs, écoutant avec attention et un sourire sincère. Sa voisine aux longues tresses bleues, en débardeur blanc et mini-jupe noire, est assise en face de lui sur une chaise en bois, parlant avec vivacité et émotion. Même style de peinture numérique africaine douce, même éclairage intime chaleureux. Génère le Master Prompt de cette suite en gardant exactement les mêmes personnages.
\`\`\`

#### Le Master Prompt 2 généré (À copier) :

\`\`\`text
Ultra realistic African digital painting style, extremely soft stylized rendering, beautiful cinematic Netflix-style African drama, 1:1 square composition, exceptionally beautiful characters, elegant intimate nighttime atmosphere.

Inside Ariel's modest studio room in Abomey-Calavi, softly illuminated by warm ambient lighting. Ariel, 21 years old, extraordinarily handsome, refined youthful facial features, charming slightly green eyes, smooth luminous skin, short perfectly groomed black hair, wearing clean white shorts, is sitting on the edge of his wooden bed listening attentively with a warm sincere expression.

Next to him on a wooden chair sits his stunning neighbor, adult African woman with warm sun-kissed bronzed complexion, very long blue braids cascading down, wearing her fitted black mini-skirt and white sleeveless tank top, delicate nose piercing and ankle chains, speaking with earnest emotion and hand gestures.

Natural intimate interaction, soft cinematic shadows, romantic African drama aesthetic, highly detailed skin and hair textures, painterly digital art masterpiece, pristine 8K quality, 1:1 square format.
\`\`\`

#### Le Rendu produit par Gemini pour la Scène 2 :

On colle ce deuxième prompt dans Gemini, et l'image sort avec les mêmes visages et la même ambiance :

![Scène 2 : Ariel et sa voisine discutant à l'intérieur de la chambre](/images/formation/ariel-voisine-scene-2.jpg)

---

### Scène 3 : La Révélation et le Choc (Le Cliffhanger)

Toujours dans le même fil, vous commandez la troisième action pour clore l'épisode sur un suspense insoutenable :

#### Ce que vous écrivez à ChatGPT :

\`\`\`text
Suite de la scène pour clore l'épisode sur un suspense insoutenable : la voisine s'est approchée tout près d'Ariel, lui a pris la main avec une grande vulnérabilité et lui murmure une révélation bouleversante à l'oreille. Ariel est figé par le choc et la stupéfaction, les yeux écarquillés. Cadrage rapproché intime sur leurs deux visages. Génère le Master Prompt cinématique de ce moment intense.
\`\`\`

#### Le Master Prompt 3 généré (À copier) :

\`\`\`text
Ultra realistic African digital painting style, extremely soft stylized rendering, beautiful cinematic Netflix-style African drama, 1:1 square composition, exceptionally beautiful characters, elegant intimate nighttime atmosphere.

Close cinematic two-shot inside the warm studio room. Ariel, 21 years old, extraordinarily handsome, refined facial features, smooth skin, short black hair, is looking at his neighbor with an intense, surprised and emotionally touched expression, eyes wide.

His beautiful adult female neighbor with warm bronzed skin, delicate nose piercing, very long blue braids, white sleeveless tank top, leans in closer, holding his hand with sincere vulnerability, whispering a shocking revelation.

Warm golden ambient lamp lighting, deep soft cinematic shadows, emotional cliffhanger intensity, African Netflix drama masterpiece, flawless skin and facial proportions, pristine 8K quality, 1:1 square format.
\`\`\`

#### Le Rendu produit par Gemini pour la Scène 3 :

On colle ce troisième prompt dans Gemini, et l'on obtient ce moment dramatique captivant :

![Scène 3 : La révélation murmurée et le choc dans le regard d'Ariel](/images/formation/ariel-voisine-scene-3.jpg)

---

### Pourquoi cette méthode fait toute la différence :

* **ChatGPT fait tout le travail de conception complexe** : vous n'avez pas besoin d'inventer des termes techniques en anglais, vous lui donnez votre idée en français et il vous sort un Master Prompt digne d'Hollywood.
* **Gemini produit un rendu visuel d'une beauté pure** : pas de défauts, des teints magnifiques, une lumière cinématographique et un respect total du style peinture numérique.
* **La cohérence est absolue** : Ariel garde sa tête, ses yeux et sa coiffure, et la voisine conserve ses superbes tresses bleues tout au long de l'intrigue.

Dans la prochaine étape (**Étape 3 : L'Incrustation des Textes & Bulles de Dialogue**), nous allons voir comment habiller ces scènes de dialogues percutants sans jamais gâcher la beauté du dessin !`,
            tip: "Cliquez toujours sur le bouton double carré pour copier l'intégralité du prompt d'un seul geste avant de le coller dans Gemini."
          }
        ]
      },
      {
        id: "ch3",
        chapterNumber: 3,
        title: "Étape 3 : L'Incrustation des Textes & Bulles de Dialogue sur vos Images",
        locked: false,
        pages: [
          {
            pageNumber: 9,
            title: "3.1 L'Art du Dialogue Visuel & Les Outils Disponibles",
            heroImage: "/images/formation/lessons/bd_etape3_bulles_dialogue.jpg",
            type: "step",
            content: `### Donner de la voix à vos héros sans gâcher la beauté du dessin

Une belle image retient l'œil deux secondes, mais c'est **le dialogue incrusté directement sur l'image** qui transforme votre publication en une véritable bande dessinée vivante.

Lorsque vos abonnés parcourent leur fil d'actualité, la bulle de dialogue accroche immédiatement le regard et les plonge instantanément au cœur de l'intrigue.

#### La règle d'or pour positionner vos bulles

Beaucoup de débutants commettent l'erreur d'étaler des bulles géantes qui cachent les visages ou gâchent l'esthétique du dessin :

* **Ce qui est permis** : La bulle peut légèrement toucher le personnage ou empiéter discrètement sur le bord de l'épaule ou du décor si la scène est serrée.
* **Ce qui est formellement interdit** : Ne masquez **jamais** les visages, les yeux, ni les expressions faciales des personnages. La bulle doit toujours rester compacte et aérée.
* **Les répliques courtes** : Privilégiez des répliques percutantes de 4 à 8 mots. Vos lecteurs doivent comprendre la situation en un coup d'œil de deux secondes.

#### L'astuce pro : Télécharger des bulles PNG transparentes sur Google

Vous n'êtes pas obligé de vous limiter aux formes fournies par votre application de retouche :
* Allez sur **Google Images** et tapez simplement : *« bulle de dialogue PNG transparent »* ou *« speech bubble transparent PNG »*.
* Choisissez le modèle de bulle qui correspond à votre style (ovale, rectangulaire, style manga ou comics) et téléchargez-le gratuitement.
* Dans votre application, il vous suffit ensuite d'importer cette bulle comme un calque photo pour y écrire votre texte par-dessus !

#### Les applications recommandées sur le Play Store

Sur Android (Play Store), vous pouvez trouver d'excellentes applications gratuites en tapant deux termes de recherche clés :
👉 **« ajouter texte sur photo »**  
👉 **« bulles de dialogue »**

Parmi les meilleures applications disponibles, on retrouve notamment **PixelLab**, et surtout l'application la plus simple, rapide et directe au quotidien : **« Ajouter du texte »** que nous allons utiliser pour notre cas pratique.`,
            checklist: [
              "La bulle ne masque ni le visage ni les regards des personnages",
              "La réplique est courte, percutante et facile à lire en 2 secondes",
              "La bulle est contrastée avec un fond clair et une écriture nette",
              "L'image conserve toute son intensité dramatique sans être surchargée"
            ]
          },
          {
            pageNumber: 10,
            title: "3.2 Cas Pratique : Tutoriel Pas-à-Pas avec « Ajouter du texte »",
            heroImage: "/images/formation/lessons/bd_etape3_bulles_dialogue.jpg",
            type: "step",
            content: `### Tutoriel complet : De l'image brute à la planche BD terminée

Voici la méthode pas-à-pas en 13 étapes concrètes avec l'application **« Ajouter du texte »** pour habiller notre première scène de feuilleton.

---

#### Étape 1 : Télécharger et lancer l'application

![Étape 1 : Icône de l'application Ajouter du texte sur le Play Store](/images/formation/bulles/bulle-step-1-icone-app.png)

Téléchargez l'application **« Ajouter du texte »** (icône bleue avec le symbole +T) sur le Google Play Store.  
Lancez l'application et appuyez sur l'écran pour importer l'image de votre scène générée dans Gemini.

---

#### Étape 2 : Ouvrir le catalogue des formes

![Étape 2 : Clic sur l'icône Forme dans la barre d'outils](/images/formation/bulles/bulle-step-2-menu-forme.png)

Dans la barre d'outils inférieure sous la section *Ajouter Calque*, cliquez sur le bouton **« Forme »** (indiqué par la flèche verte).  
Ce menu ouvre la bibliothèque complète des formes géométriques et des bulles prêtes à l'emploi.

---

#### Étape 3 : Choisir la bulle de dialogue

![Étape 3 : Sélection de la bulle de dialogue ovale dans la galerie](/images/formation/bulles/bulle-step-3-choix-bulle.png)

Dans la grille des formes, appuyez sur la **bulle de dialogue ovale** avec la pointe orientée vers le bas (entourée en vert).  
La bulle s'insère immédiatement au milieu de votre image pour démarrer la mise en page.

---

#### Étape 4 : Régler la couleur et positionner la bulle

![Étape 4 : Réglage de la taille, de la couleur blanche et de l'opacité](/images/formation/bulles/bulle-step-4-ajustement-bulle.png)

Sélectionnez la couleur **blanche** dans la palette inférieure et conservez l'opacité à **100%**.  
Glissez la bulle au-dessus de votre personnage en orientant la pointe vers sa bouche, sans jamais masquer son visage.

---

#### Étape 5 : Saisir la réplique du dialogue

![Étape 5 : Saisie de la réplique au clavier dans le champ de texte](/images/formation/bulles/bulle-step-5-saisie-texte.png)

Cliquez sur **« Ajouter du texte »** (+T) pour ouvrir le clavier et saisir votre réplique : *« 1- S'il te plaît aide moi »*.  
Appuyez ensuite sur la coche de validation en haut à droite pour appliquer votre texte sur l'image.

---

#### Étape 6 : Choisir la police et le style d'écriture

![Étape 6 : Réglage de la typographie et du style dans le menu inférieur](/images/formation/bulles/bulle-step-6-style-police.png)

Dans la barre d'outils inférieure, ouvrez l'onglet **« Police »** pour choisir une typographie élégante et lisible sur smartphone.  
Appliquez une couleur **noire** bien contrastée pour assurer une lecture instantanée sur le fond blanc.

---

#### Étape 7 : Centrer le texte dans la bulle

![Étape 7 : Texte parfaitement centré dans la bulle de dialogue](/images/formation/bulles/bulle-step-7-texte-dans-bulle.png)

Redimensionnez et glissez le texte au centre exact de la bulle en laissant de belles marges blanches tout autour.  
Votre dialogue principal est désormais parfaitement cadré, percutant et facile à lire en deux secondes.

---

#### Étape 8 : Apposer votre signature ou logo de chaîne

![Étape 8 : Ajout du logo ou filigrane Mr Ben TV en bas à droite](/images/formation/bulles/bulle-step-8-signature-mr-ben.png)

Ajoutez un petit calque texte ou encart avec le nom de votre chaîne (ici le badge rose *« Mr Ben TV »*).  
Placez-le discrètement dans le coin inférieur droit pour protéger votre planche contre les copies sans gêner l'action.

---

#### Étape 9 : Créer le support circulaire pour la vignette

![Étape 9 : Insertion d'un calque de forme supplémentaire](/images/formation/bulles/bulle-step-9-deuxieme-forme.png)

Retournez dans le menu **« Forme »** et insérez un cercle blanc que vous placez dans le coin inférieur gauche.  
Ce cercle blanc servira de contour net et régulier pour accueillir une vignette secondaire de rappel ou de flashback.

---

#### Étape 10 : Découper la seconde photo en rond

![Étape 10 : Découpe circulaire de la photo secondaire avec l'outil Recadrer](/images/formation/bulles/bulle-step-10-recadrage-format.png)

Importez votre seconde photo via l'option **« Photo »**, puis cliquez sur l'outil **« Recadrer »** dans la barre inférieure.  
Sélectionnez l'icône de découpe circulaire **« ○ »** pour arrondir la photo, puis validez avec la coche en haut à droite.

---

#### Étape 11 : Ajuster la vignette et lancer l'exportation

![Étape 11 : Vignette ronde superposée et lancement de l'exportation](/images/formation/bulles/bulle-step-11-vignette-ronde.png)

Ajustez la photo ronde sur le support blanc pour créer une vignette parfaite illustrant la situation dramatique des blessés.  
Une fois la composition terminée, cliquez sur la **flèche noire (➔)** tout en haut à droite pour passer à l'enregistrement.

---

#### Étape 12 : Choisir le type de sauvegarde

![Étape 12 : Écran Enregistrer et partager avec choix du format Image](/images/formation/bulles/bulle-step-12-menu-sauvegarde.png)

Sur l'écran de synthèse en format carré **1024 x 1024**, repérez la section **« Enregistrer »**.  
Cliquez directement sur le bouton **« Image »** pour ouvrir les paramètres de fichier.

---

#### Étape 13 : Valider l'enregistrement en haute qualité

![Étape 13 : Modal d'exportation au format PNG qualité 90%](/images/formation/bulles/bulle-step-13-export-final.png)

Dans la fenêtre d'export, cochez le format **PNG** (ou JPEG) et laissez la qualité réglée sur **90%**.  
Appuyez sur le bouton noir **« ENREGISTRER »** : votre planche finale est sauvegardée dans votre galerie, prête pour la publication !`,
            tip: "Enregistrez toujours votre projet au format 'Projet' dans l'application avant d'exporter l'image finale : cela vous permettra de modifier facilement le texte plus tard si nécessaire sans avoir à tout recommencer."
          }
        ]
      },
      {
        id: "ch4",
        chapterNumber: 4,
        title: "Étape 4 : La Stratégie de Publication & Croissance sur les Réseaux",
        locked: false,
        pages: [
          {
            pageNumber: 11,
            title: "4.1 Le Rythme Quotidien, l'Animation de la Page & Le Tremplin Vidéo IA",
            type: "step",
            content: `### La méthode pour faire grandir votre audience et exploser en abonnés

Créer de magnifiques planches avec des dialogues percutants est indispensable, mais ce qui transforme une page débutante en une communauté active et passionnée, c'est votre rigueur de publication.

---

#### 1. Combien de fois publier par jour ?

La régularité est le premier secret pour que les algorithmes de Facebook, TikTok et Instagram recommandent naturellement vos créations :

* **Le minimum indispensable** : Publiez **au moins 2 fois par jour**. Vous pouvez caler une première publication vers la mi-journée (12h - 13h) et une seconde le soir (entre 18h et 21h), aux moments où les gens sont les plus connectés.
* **Pour une croissance accélérée** : Si vous avez le temps et la capacité de production, vous pouvez monter **jusqu'à 4 publications par jour**.
* **La règle d'or** : Mieux vaut maintenir 2 posts par jour avec constance 7 jours sur 7, que de publier 5 fois un jour puis disparaître pendant une semaine. La constance habitue votre communauté à attendre votre rendez-vous.

---

#### 2. Deux types de publications indispensables à alterner

Pour éviter la monotonie et maintenir un niveau d'interaction élevé sur votre page, alternez deux formats clés :

* **Les publications d'histoire (Feuilleton BD)** : Ce sont vos épisodes principaux avec suspense. Ils doivent captiver, intriguer et pousser directement les abonnés à commenter, débattre ou répondre avec le sourire et des émotions.
* **Les publications d'animation de la galerie** : Des publications plus légères pour animer votre communauté entre deux épisodes majeurs. Vous pouvez partager un visuel surprenant, poser un dilemme amusant ou lancer une devinette sur un personnage pour garder votre page vivante et active à tout moment.

---

#### 3. Déclencher un maximum de réactions dès la première heure

Pour que votre publication devienne virale et soit montrée à des milliers de personnes hors de votre cercle d'abonnés :

* **Les 30 premières minutes sont cruciales** : Répondez aux premiers commentaires dès la mise en ligne pour envoyer un signal fort à l'algorithme.
* **Privilégiez les émotions et le sourire** : Les répliques qui font sourire, qui surprennent ou qui touchent à la vie quotidienne sont celles qui génèrent le plus de partages naturels.

---

#### 4. Pour aller plus loin : La Création de Vidéos Virales avec l'IA

Les planches de BD sont idéales pour fidéliser vos lecteurs, mais pour toucher une audience encore plus vaste sur TikTok, Reels et Shorts, la vidéo animée est le format roi. Si vous souhaitez apprendre à donner vie à vos personnages et animer vos scènes sans rien dépenser, découvrez la formation complète ci-dessous :`,
            promoButton: {
              text: "Découvrir la Formation Vidéos IA",
              bookId: "livre-videos-ia"
            },
            checklist: [
              "Publier au minimum 2 fois par jour (jusqu'à 4 fois selon votre rythme)",
              "Alterner entre épisodes scénarisés et publications d'animation de la page",
              "Poser des questions ouvertes pour inciter les abonnés à débattre et commenter",
              "Répondre rapidement aux premières réactions pour activer l'algorithme"
            ],
            tip: "La régularité bat le talent : publiez chaque jour à heures fixes, vos abonnés deviendront rapidement accros à votre feuilleton."
          }
        ]
      }
    ]
  },
  {
    id: "livre-videos-ia",
    type: "video",
    title: "Création de Vidéos Virales avec l'IA",
    subtitle: "La méthode officielle de Mr Ben",
    coverTag: "FORMATION 2",
    price: 3100,
    originalPrice: 6000,
    currency: "FCFA",
    badge: "Formation 2",
    description: "La méthode pas à pas de Mr Ben pour créer des histoires en vidéos animées percutantes et virales avec l'intelligence artificielle.",
    freePreviewPages: 1,
    chapters: [
      {
        id: "vch1",
        chapterNumber: 1,
        title: "Étape 1 : Le Rôle de Google Gemini — De l'Image au Prompt Vidéo Court",
        locked: false,
        pages: [
          {
            pageNumber: 1,
            title: "Vue d'ensemble : Ce que résume cette formation",
            type: "intro",
            content: `### Bienvenue dans ma méthode de création vidéo

Aujourd'hui sur les réseaux sociaux, la vidéo courte au format vertical est devenue le moyen le plus puissant et le plus rapide au monde pour capter l'attention et faire grandir une communauté.

Des millions d'utilisateurs parcourent chaque jour TikTok, Facebook Reels et YouTube Shorts. Une simple image retient l'œil deux secondes, mais une vidéo animée vibrante captive, touche l'émotion et pousse naturellement à s'abonner.

Pourtant, la plupart des débutants se bloquent : ils pensent qu'il faut un studio d'enregistrement, un micro professionnel, des voix compliquées enregistrées à part ou des logiciels de montage payants. C'est faux.

Dans cette formation, je vais vous transmettre **ma méthode directe, concrète et 100% accessible avec un simple téléphone portable**. Vous allez apprendre à partir d'une simple image de base pour lui donner vie, mouvement et émotion en clips courts grâce à l'intelligence artificielle, puis à les assembler en véritables feuilletons vidéos viraux sans rien dépenser.

#### Ce que vous allez maîtriser pas à pas :

Cette formation est construite comme un parcours progressif en 3 étapes indispensables :

* **Étape 1 : Le Rôle de Google Gemini — De l'Image au Prompt Vidéo Court** — Comment apprêter votre fil de discussion avec Gemini, verrouiller le format vertical 9:16 et lui faire rédiger des prompts courts et percutants avec les actions et les répliques intégrées.
* **Étape 2 : Google Flow & L'Assemblage — Génération des Clips, Secrets des Crédits & Montage (CapCut / YouCut)** — La méthode pour générer vos clips en quelques secondes, l'astuce du multi-comptes pour les crédits gratuits illimités, et la fusion rapide de vos séquences avec votre signature de chaîne.
* **Étape 3 : La Stratégie de Publication & Croissance sur les Réseaux** — Le rythme quotidien (minimum 1 vidéo/jour), les créneaux d'or, la magie des hashtags sous la description et le tremplin du Storytelling BD.

Vous n'avez pas besoin de compétences techniques avancées. Avec votre téléphone, une connexion internet et de la méthode, vous avez entre les mains tout ce qu'il faut pour commencer.`,
            tip: "Prenez le temps d'assimiler chaque étape dans l'ordre. La puissance d'une vidéo commence toujours par la clarté de votre intention."
          },
          {
            pageNumber: 2,
            title: "1.1 Apprêter l'interface de discussion avec Google Gemini",
            type: "step",
            content: `### Comment conditionner Google Gemini pour devenir votre scénariste vidéo

Si vous arrivez dans Google Gemini et que vous lui demandez simplement : *« Fais-moi une vidéo »*, vous obtiendrez des pavés de texte inutiles, des prompts trop longs ou des explications inadaptées.

Pour obtenir des résultats parfaits, vous devez d'abord **apprêter votre fil de discussion** en lui fixant des règles de travail strictes et non négociables.

---

#### Le message d'amorce à copier et envoyer à Google Gemini

Ouvrez une conversation dans **Google Gemini** (gemini.google.com ou sur l'application mobile) et collez ce message de cadrage avant de commencer la moindre création :

\`\`\`cadrage
Tu es mon assistant réalisateur et scénariste vidéo spécialisé dans la création de feuilletons courts pour les réseaux sociaux.

Voici les règles absolues que tu dois respecter pour chaque scène :
1. Je vais t'envoyer les images de mes scènes de feuilleton au fur et à mesure, accompagnées d'une brève description en français de ce que font les personnages et de leurs paroles.
2. Ton rôle unique est de rédiger un prompt vidéo court, concis et cinématographique en anglais, destiné à un outil de génération vidéo (Google Flow).
3. Le prompt doit TOUJOURS être calibré pour le format vertical 9:16 (format plein écran pour TikTok, Facebook Reels et YouTube Shorts).
4. Le prompt doit rester TRÈS COURT (3 à 5 lignes maximum). Il doit décrire le mouvement subtil de caméra, l'émotion du personnage, l'ambiance lumineuse, et intégrer les répliques ou paroles avec la voix indiquée entre parenthèses : ("paroles du personnage").
5. Tu ne dois JAMAIS générer d'image toi-même. Fournis-moi uniquement le prompt vidéo final dans un bloc de texte propre, prêt à être copié.

Réponds simplement "C'est bien compris réalisateur, envoie-moi ta première image et ton action !" pour valider.
\`\`\`

---

#### Pourquoi Google Gemini est l'outil idéal pour cette étape

Contrairement à d'autres outils, **Google Gemini** est 100% gratuit, accessible directement avec votre compte Google habituel, et possède une vision artificielle d'une précision remarquable pour analyser instantanément les visages, vêtements et ambiances de vos images afin de rédiger des prompts vidéo en anglais parfaitement calibrés pour Google Flow.`,
            checklist: [
              "Le fil de discussion est dédié uniquement à la création des prompts de votre série",
              "Le format 9:16 vertical est expressément verrouillé dans les consignes",
              "L'interdiction de générer des images est clairement rappelée à Gemini"
            ],
            tip: "Ne mélangez jamais vos recherches du quotidien dans ce fil : conservez cette conversation ouverte pour toute la durée de votre feuilleton."
          },
          {
            pageNumber: 3,
            title: "1.2 La méthode d'envoi scène par scène & L'Exemplaire de Prompt",
            type: "step",
            content: `### Le déroulement concret pour chaque scène de votre feuilleton

Pour bien comprendre comment animer vos personnages sans la moindre erreur, prenons un exemple concret et direct : **une scène de confrontation dramatique entre deux personnages, Koffi et Amina**.

Amina détient un dossier confidentiel contre sa poitrine et vient demander des comptes à Koffi dans le salon familial.

---

#### 1. L'image de base générée au format vertical 9:16

Voici l'image de départ que nous avons préparée pour ce premier plan :

![L'image de départ générée au format vertical 9:16 : Amina en robe wax jaune tenant le dossier rouge face à Koffi en costume](/images/formation/scene-video-koffi-amina.jpg)

Regardez attentivement cette image : nous avons deux personnages aux allures bien distinctes :
* **Koffi** : costume noir élégant, chemise blanche entrouverte, regard bouleversé et larmes aux yeux.
* **Amina** : robe wax jaune et verte, tresses soignées, visage ému et dossier rouge serré fermement contre elle.

---

#### 2. Pourquoi devez-vous TOUJOURS envoyer l'image à Gemini en premier ?

C'est une règle d'or fondamentale : **envoyez toujours votre image à Google Gemini avant de décrire l'action et les dialogues.**

**Pourquoi cette étape est-elle indispensable ?**  
Quand votre scène réunit deux personnages, l'outil de génération vidéo (Google Flow) a impérativement besoin de savoir **qui parle et qui bouge**.

Si vous vous contentez d'écrire un prompt sans photo du type : *« L'homme et la femme se disputent et elle lui crie dessus »*, l'intelligence artificielle risque de s'emmêler : elle peut faire bouger les lèvres de l'homme avec la réplique d'Amina, ou faire parler les deux personnages en même temps de façon incohérente.

En transmettant d'abord la photo à **Google Gemini**, l'IA analyse et mémorise tous les repères visuels (les vêtements, les couleurs, les accessoires et les visages). Dans le prompt en anglais qu'elle va produire, Gemini relie directement chaque parole à la tenue du bon personnage (*« the woman in the yellow wax dress speaks... while the man in the black suit looks down... »*). **Résultat : aucun risque d'inversion, chaque acteur anime sa propre voix avec précision !**

---

#### 3. Le calcul du temps et des paroles : Adapter vos répliques (6 secondes vs 8 secondes)

Une scène vidéo n'est pas cantonnée à un monologue : vous pouvez très bien faire dialoguer deux personnages. **Mais la longueur de vos conversations dépend strictement du nombre de secondes que vous choisissez pour votre clip :**

* **Pour un clip de 6 secondes :**  
  6 secondes passent extrêmement vite. Vous devez limiter les paroles à **une seule réplique percutante (4 à 6 mots)** ou un échange ultra-court.
  
* **Pour un clip de 8 secondes :**  
  Vous disposez de plus de temps pour installer un véritable échange de **deux courtes répliques bien rythmées (environ 10 à 12 mots au total)**.

> **Le piège du surplus de paroles :**  
> Si vous mettez trop de conversations dans un clip de 6 secondes, cela ne va pas déformer le visage de vos personnages, mais la voix va débiter les mots à une vitesse anormale et précipitée. Pire encore : **le clip de 6 secondes va se couper net et tronquer la phrase avant la fin !** Prenez toujours le temps de bien doser vos répliques en fonction de la durée choisie.

---

#### 4. L'échange en situation réelle dans Google Gemini

Voici concrètement comment vous formulez votre demande à Gemini après avoir importé l'image :

![Capture réelle dans Google Gemini — L'image importée, la consigne pour un clip de 6s avec la réplique, et le prompt cinématique généré avec le bouton Copier](/images/formation/gemini-video-prompt-exchange.jpg)

* **Ce que vous écrivez à Gemini avec la photo :**  
  *« Voici l'image de ma scène. Pour un clip de 6 secondes sur Google Flow, décris l'action et les vêtements pour qu'Amina parle en premier : ("1- Dis-moi la vérité Koffi !"). Prompt vertical 9:16 très court. »*

---

#### 5. Le Prompt Vidéo Court prêt à être copié pour Google Flow

Gemini formule alors instantanément ce prompt cinématique court, direct et parfaitement calibré pour Google Flow :

\`\`\`prompt
Vertical 9:16 cinematic video. Slow dramatic push-in on the African man in the black suit and white shirt, and the young African woman in the yellow and green wax print dress holding a red folder. Tear-streaked faces with intense emotion. The woman speaks firmly with a trembling desperate voice: ("1- Dis-moi la vérité Koffi !"). The man looks down stunned and silent. Dramatic cinematic living room lighting. Ultra-realistic African drama.
\`\`\`

Pour la scène suivante de votre épisode, restez simplement dans la même discussion Gemini : importez la photo suivante et décrivez l'action suivante pour obtenir votre prompt vidéo n°2 !`,
            checklist: [
              "La photo de la scène est bien envoyée en premier à Gemini pour ancrer les vêtements et les rôles",
              "La quantité de répliques est rigoureusement adaptée à la durée du clip (6s ou 8s)",
              "Les paroles exactes du personnage sont indiquées entre guillemets et parenthèses : (\"...\")"
            ],
            tip: "Cliquez sur le bouton « Copier » sur la carte blanche ci-dessus pour coller directement le prompt dans Google Flow."
          }
        ]
      },
      {
        id: "vch2",
        chapterNumber: 2,
        title: "Étape 2 : Google Flow & L'Assemblage — Génération des Clips, Secrets des Crédits & Montage",
        locked: false,
        pages: [
          {
            pageNumber: 4,
            title: "2.1 Génération sur Google Flow & Montage Rapide (CapCut / YouCut)",
            type: "step",
            content: `### Du Prompt au Clip Vidéo : Le Guide Pas à Pas sur Google Flow

Une fois votre prompt préparé dans Google Gemini, vous ouvrez **Google Flow** (\`flow.google.com\`) sur le navigateur de votre smartphone. Suivez ces 10 étapes simples pour générer votre vidéo et la télécharger.

---

#### 1. Créer votre espace de travail

![1. Accueil Google Flow — Cliquez sur Nouveau projet](/images/formation/google-flow/01-accueil-nouveau-projet.png)

* **Ce qu'il faut faire :** Rendez-vous sur \`flow.google.com\` avec votre compte Google et appuyez sur le bouton **\`+ Nouveau projet\`**.

---

#### 2. L'espace de création vierge

![2. Canevas vierge prêt pour la création](/images/formation/google-flow/02-espace-projet-vierge.png)

* **Ce qu'il faut faire :** Vous arrivez sur votre espace de travail. C'est ici que vous allez déposer vos visuels et gérer vos clips.

---

#### 3. Configurer le format 9:16 et le modèle vidéo

![3. Panneau de réglage — Vidéo, Format vertical 9:16, Veo 3.1 Lite](/images/formation/google-flow/03-configuration-video-9-16.png)

* **Ce qu'il faut faire :** Ouvrez le panneau de réglages en bas et ajustez impérativement ces 3 options :
  * Activez l'onglet **\`Vidéo\`** (au lieu d'Image).
  * Cochez le format vertical **\`9:16\`** (format plein écran obligatoire pour TikTok, Reels et Shorts).
  * Choisissez le modèle **\`Veo 3.1 - Lite\`** *(Durée : 8 s • Résolution : 720p • Coût : 10 crédits)*.

---

#### 4. Ouvrir le menu d'importation

![4. Menu d'options — Appuyez sur Importer](/images/formation/google-flow/04-menu-importer-image.png)

* **Ce qu'il faut faire :** En haut de votre écran, touchez l'icône **\`+\`**, puis appuyez sur **\`Importer\`**.

---

#### 5. Téléverser votre image de scène

![5. Chargement de votre photo depuis la galerie](/images/formation/google-flow/05-chargement-image-galerie.png)

* **Ce qu'il faut faire :** Sélectionnez dans la galerie de votre téléphone l'image que vous souhaitez animer. La jauge de progression s'affiche jusqu'à 100%.

---

#### 6. L'image est chargée sur votre canevas

![6. Image source prête sur le canevas de travail](/images/formation/google-flow/06-image-prete-canevas.png)

* **Ce qu'il faut faire :** Votre photo apparaît maintenant sous forme de vignette (ex: \`1001066949.jpg\`) directement sur votre plan de travail.

---

#### 7. Attacher l'image et coller le prompt

![7. Image attachée en bas et collage du prompt](/images/formation/google-flow/07-coller-prompt-generer.png)

* **Ce qu'il faut faire :** 
  * Touchez l'image pour l'accrocher dans le champ de saisie en bas (une petite vignette apparaît avec une croix).
  * Collez votre prompt en anglais préparé dans Gemini à l'emplacement **\`Collez le prompt\`**.
  * Appuyez sur la **flèche d'envoi (\`➔\`)** pour lancer la création.

---

#### 8. Votre clip vidéo est généré

![8. Vidéo générée avec l'icône Play à côté de l'image](/images/formation/google-flow/08-video-generee-canevas.png)

* **Ce qu'il faut faire :** Au bout de quelques instants, votre vidéo terminée apparaît à côté de votre photo avec le logo **Play (▶)**.

---

#### 9. Vérifier le résultat en plein écran

![9. Lecteur plein écran pour contrôler le mouvement et le son](/images/formation/google-flow/09-lecteur-video-plein-ecran.png)

* **Ce qu'il faut faire :** Touchez la vidéo pour l'ouvrir dans le lecteur plein écran. Lancez la lecture pour vérifier que les mouvements sont naturels et que la voix résonne bien pendant les 8 secondes.

---

#### 10. Télécharger le fichier MP4 sur votre téléphone

![10. Menu de téléchargement — Télécharger la vidéo](/images/formation/google-flow/10-telecharger-video-mp4.png)

* **Ce qu'il faut faire :** Cliquez sur l'icône d'options en haut à droite du lecteur et choisissez **\`Télécharger la vidéo\`**. Le fichier MP4 est immédiatement enregistré dans votre téléphone, prêt pour le montage !

---

#### Le Secret des Crédits Illimités de Mr Ben

Sur Google Flow, chaque clip de 8 secondes consomme **10 crédits** sur votre solde gratuit quotidien. 

* **L'astuce pour ne jamais être bloqué :** Dès que vos crédits du jour arrivent à zéro, appuyez sur votre photo de profil en haut à droite, déconnectez-vous et connectez-vous avec un second compte Google (vous pouvez en créer autant que vous voulez gratuitement).
* Vous récupérez instantanément un **nouveau pack complet de crédits gratuits** pour continuer à créer vos scènes sans interruption et sans jamais débourser un centime !

---

#### 11. L'Assemblage de vos clips & La Signature de Chaîne (CapCut ou YouCut)

Une fois tous vos extraits vidéo téléchargés dans votre téléphone (que vous ayez généré des séquences courtes de 6s, 8s, 10s ou plus selon les besoins de votre histoire), vous n'avez pas besoin d'ordinateur ni de logiciel complexe pour les fusionner en un feuilleton continu.

Tout se fait directement sur votre smartphone grâce à deux applications gratuites indispensables :

* **CapCut — La plus puissante et la plus complète :**  
  C'est l'application de référence des créateurs de contenu professionnels. Elle propose une panoplie impressionnante d'outils avancés, des transitions travaillées, des effets visuels soignés et un contrôle très précis sur l'audio et le texte. Si vous aimez peaufiner vos vidéos dans les moindres détails, CapCut est l'outil parfait.

* **YouCut — La plus simple, rapide et facile à utiliser :**  
  Si vous débutez et que vous voulez aller droit au but sans vous perdre dans des menus compliqués, YouCut est le choix idéal. Très légère et ultra-intuitive, elle permet de charger vos clips, de les ordonner, de couper les surplus et d'exporter votre film en quelques clics sans aucune prise de tête.

---

#### La méthode d'assemblage pas à pas :

1. **Créer un nouveau projet :** Ouvrez l'application de votre choix (CapCut ou YouCut) sur votre smartphone et appuyez sur **Nouveau projet**.
2. **Importer vos clips dans l'ordre chronologique :** Sélectionnez dans votre galerie tous les fichiers MP4 téléchargés depuis Google Flow, en respectant la suite logique de vos scènes (Scène 1, Scène 2, Scène 3...).
3. **Apposer votre signature de chaîne (Le réflexe indispensable) :** Utilisez l'outil **Texte** pour inscrire votre nom de chaîne ou pseudo dans un coin supérieur de la vidéo (par exemple : *@MrBenOfficiel*).  
   *Pourquoi cette signature est capitale ?* Elle protège vos feuilletons contre le vol de contenu et permet aux milliers de spectateurs qui découvrent votre vidéo dans leur fil d'actualité d'identifier votre chaîne pour s'abonner immédiatement.
4. **Exporter votre feuilleton final :** Assurez-vous que le format d'exportation est bien réglé sur le **format vertical 9:16** et sélectionnez la résolution **1080p**. En moins d'une minute, votre vidéo complète est prête pour la publication !`,
            checklist: [
              "Le format est bien verrouillé sur 9:16 vertical sur Google Flow",
              "La photo est bien rattachée dans le champ avant de coller le prompt",
              "Tous les clips de l'épisode sont téléchargés dans la galerie",
              "Les séquences sont assemblées avec votre signature de chaîne sur CapCut ou YouCut"
            ],
            tip: "Une signature propre et discrète dans un coin supérieur valorise votre travail sans jamais gêner la lecture de la vidéo."
          }
        ]
      },
      {
        id: "vch3",
        chapterNumber: 3,
        title: "Étape 3 : La Stratégie de Publication & Croissance sur les Réseaux",
        locked: false,
        pages: [
          {
            pageNumber: 5,
            title: "3.1 Le Rythme Quotidien, les Hashtags Stratégiques & Le Tremplin Storytelling",
            type: "step",
            content: `### La méthode pour faire décoller vos vidéos et bâtir un empire d'abonnés

Même la vidéo la plus spectaculaire au monde passera inaperçue si elle est publiée sans méthode. Pour que les algorithmes de TikTok, Facebook Reels et Instagram Shorts propulsent vos créations auprès de centaines de milliers de spectateurs, vous devez adopter une rigueur quotidienne et maîtriser les leviers invisibles de la viralité.

La réussite sur les réseaux ne doit rien au hasard : elle repose sur la régularité, le choix du moment idéal et l'optimisation minutieuse de vos descriptions.

---

#### 1. Le Rythme Indispensable : Au Minimum Une Vidéo par Jour

Ne laissez jamais votre chaîne s'endormir. Pour installer durablement votre univers dans l'esprit des gens et stimuler en continu les robots de recommandation :

* **Publiez au minimum une vidéo par jour** : C'est le seuil fondamental. Chaque jour où vous publiez au moins une création, vous envoyez un signal fort à l'algorithme prouvant que votre compte est dynamique et digne d'être mis en avant.
* **La constance forge l'empire** : Une présence quotidienne ininterrompue habitue votre audience à guetter votre prochain contenu. C'est ainsi que de simples spectateurs de passage se métamorphosent en une communauté d'abonnés fidèles et passionnés.
* **La règle d'or** : La régularité bat toujours le talent isolé. Mieux vaut publier au minimum une belle vidéo chaque jour que d'en poster trois en un week-end puis disparaître. La persévérance quotidienne est le secret numéro un des créateurs qui réussissent.

---

#### 2. Les 2 Créneaux d'Or Stratégiques

Pour que votre vidéo quotidienne bénéficie de la plus grande visibilité, choisissez en priorité l'une des deux fenêtres d'attention maximale de la journée :

* **Le Créneau de la Journée : De 08h00 à 13h00**
  * C'est le temps fort du réveil, des trajets et de la pause de midi, où tout le monde cherche une dose d'inspiration et d'évasion sur son smartphone.
  * L'algorithme dispose de toute la journée devant lui pour analyser les premières rétentions et faire grimper votre vidéo jusqu'au pic du soir.
* **Le Grand Pic du Soir : De 20h00 à 22h00**
  * C'est l'heure reine du divertissement à domicile. Les gens sont posés, détendus et disponibles pour savourer des feuilletons captivants sans être pressés.
  * L'engagement émotionnel est au zénith : c'est le moment où les partages, les débats en commentaires et les abonnements explosent.

---

#### 3. L'Art des Hashtags sous la Description : La Boussole de l'Algorithme

Sous la description de votre vidéo, **les hashtags sont d'une importance capitale**. Trop de débutants les négligent ou mettent n'importe quoi. Les hashtags ne sont pas de simples mots : c'est la boussole qui guide l'algorithme pour catégoriser votre contenu et le présenter à la bonne audience.

* **Pourquoi sous la description ?** Dès la mise en ligne, les intelligences artificielles de TikTok, Facebook et Instagram analysent le texte de votre description et vos hashtags pour identifier le thème exact de votre feuilleton et le distribuer directement aux utilisateurs qui consomment déjà ce genre d'histoires.
* **La structure gagnante des 4 à 5 hashtags stratégiques** :
  1. **Le Hashtag Signature de votre chaîne** *(ex : #NomDeVotreChaine, #NomDeVotreSérie)* : Indispensable pour relier tous vos épisodes entre eux et permettre aux abonnés de regarder toute votre saga en un clic.
  2. **Le Hashtag de Thématique & d'Émotion** *(ex : #HistoireVraie, #Suspense, #Drame, #Amour, #Morale)* : Permet de cibler l'émotion dominante de votre scène.
  3. **Le Hashtag Créatif & Technologique** *(ex : #AnimationIA, #VideoIA, #AIAnimation)* : Positionne votre contenu sur la tendance ultra-porteuse de l'IA.
  4. **Le Hashtag de Visibilité & Tendance** *(ex : #PourToi, #FYP, #ReelsViral)* : Déclenche l'affichage dans les flux de découvertes globales.
* **Le piège à fuir** : Ne collez jamais 20 à 30 hashtags pêle-mêle. Cela brouille l'algorithme qui ne sait plus à qui recommander votre vidéo. 4 à 5 hashtags ciblés et précis sous votre description sont infiniment plus puissants !

---

#### 4. Les 15 Premières Minutes : Allumer la Flamme Algorithmique

Pourquoi les premières minutes décident-elles du destin d'une vidéo ? Dès la publication, la plateforme scrute la moindre seconde :

* **L'énergie des 15 premières minutes** : Dès la mise en ligne, plongez dans vos commentaires. Répondez avec humanité et chaleur aux premières réactions. Chaque réponse génère une notification, ramène l'abonné sur votre vidéo et envoie une alerte immédiate aux robots de diffusion : *ce contenu passionne les foules*.
* **Le magnétisme des 3 premières secondes** : Pas d'introduction molle ni de logo statique. Plongez d'emblée au cœur de l'action ou d'un regard percutant. Si vous gagnez ces 3 secondes, vous gagnez la rétention complète (*watch time*), la clé suprême pour propulser votre vidéo à l'échelle virale.

---

#### 5. Deux Formats Complémentaires qui Font Vibrer l'Audience

Pour maintenir une flamme vive et une curiosité insatiable, variez la cadence de vos vidéos :

* **L'Épisode Feuilleton (20 à 45 secondes)** : Scénarisé avec intensité narrative. Chaque réplique compte, l'émotion monte, et la scène se verrouille sur un suspense haletant (*cliffhanger*) qui pousse immédiatement à s'abonner pour voir la suite.
* **La Pépite Courte & Percutante (10 à 15 secondes)** : Action vive, réplique qui claque ou dilemme amusant pour déclencher des discussions spontanées en commentaires et garder votre page au sommet des recommandations.

---

#### 6. Pour aller plus loin : La Bande Dessinée & le Storytelling

Une belle vidéo attire l'œil, mais c'est avant tout une histoire forte et des dialogues percutants qui fidélisent votre public. Si vous souhaitez apprendre à imaginer des scénarios captivants et créer vos propres planches illustrées, découvrez la formation complète ci-dessous :`,
            promoButton: {
              text: "Découvrir la Formation BD",
              bookId: "livre-bd-storytelling"
            },
            checklist: [
              "Publier au minimum une vidéo par jour pour maintenir l'algorithme en éveil",
              "Positionner sa vidéo sur l'un des deux créneaux d'or (08h-13h ou 20h-22h)",
              "Insérer sous la description 4 à 5 hashtags ciblés (signature, émotion, IA, viralité)",
              "Activer l'algorithme dans les 15 premières minutes en répondant aux premiers commentaires"
            ],
            tip: "La constance et la précision sont les clés de l'empire : au minimum une vidéo par jour accompagnée de hashtags bien choisis sous votre description installe durablement votre contenu parmi les recommandations de l'algorithme."
          }
        ]
      }
    ]
  }
];

export const DUO_PACK = {
  id: "pack-duo-mr-ben",
  title: "Pack VIP Duo : BD Storytelling + Vidéos IA",
  subtitle: "L'intégrale des deux méthodes complètes de Mr Ben",
  price: 4600,
  originalPrice: 5600,
  discount: "1 000 FCFA d'économie",
  badge: "Offre Duo",
  includes: [
    "Accès complet à la Formation 1 (BD & Storytelling)",
    "Accès complet à la Formation 2 (Vidéos Virales avec l'IA)",
    "Tous les Prompts Masters et ressources officielles de Mr Ben"
  ]
};
