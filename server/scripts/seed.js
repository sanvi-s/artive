/**
 * Artive Database Seed Script
 * Clears existing data, then seeds Indian users, poems, visuals, and a fork tree.
 * Run from server/: node scripts/seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// ─── Models ────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    displayName: { type: String, required: true, trim: true },
    avatarUrl: String,
    bio: String,
    passwordHash: String,
  },
  { timestamps: true }
);

const SeedSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    contentSnippet: String,
    contentFull: String,
    type: { type: String, enum: ['poem', 'visual', 'music', 'other'], default: 'other' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    forkCount: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    tags: [String],
    thumbnailUrl: String,
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ForkSchema = new mongoose.Schema(
  {
    parentSeed: { type: mongoose.Schema.Types.ObjectId, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentDelta: String,
    summary: String,
    description: String,
    imageUrl: String,
    thumbnailUrl: String,
    forkCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const LineageSchema = new mongoose.Schema({
  seedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seed', required: true, unique: true },
  children: [{ type: mongoose.Schema.Types.ObjectId }],
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Seed = mongoose.models.Seed || mongoose.model('Seed', SeedSchema);
const Fork = mongoose.models.Fork || mongoose.model('Fork', ForkSchema);
const Lineage = mongoose.models.Lineage || mongoose.model('Lineage', LineageSchema);

// ─── Data ──────────────────────────────────────────────────────────────────

const SEED_USERNAMES = [
  'kavya_menon', 'arjun_sharma', 'riya_desai', 'mihir_bose', 'ananya_iyer',
  'dev_nair', 'priya_kapoor', 'rohan_sen', 'tara_krishna', 'vivaan_mehta',
  'meera_pillai', 'kabir_rastogi',
];

const USERS = [
  { username: 'kavya_menon',   displayName: 'Kavya Menon',    email: 'kavya@artive.in',   bio: "Writing from Kerala's backwaters. Poetry is my first language." },
  { username: 'arjun_sharma',  displayName: 'Arjun Sharma',   email: 'arjun@artive.in',   bio: 'Poet and philosopher from Varanasi. Sanskrit enthusiast.' },
  { username: 'riya_desai',    displayName: 'Riya Desai',     email: 'riya@artive.in',    bio: 'Mumbai-based visual artist. I paint with light and shadows.' },
  { username: 'mihir_bose',    displayName: 'Mihir Bose',     email: 'mihir@artive.in',   bio: 'Kolkata storyteller. Rabindranath lives in my words.' },
  { username: 'ananya_iyer',   displayName: 'Ananya Iyer',    email: 'ananya@artive.in',  bio: 'Carnatic musician turned poet. Sound is my canvas.' },
  { username: 'dev_nair',      displayName: 'Dev Nair',       email: 'dev@artive.in',     bio: "Kerala wanderer. Photographs the soul of India's forests." },
  { username: 'priya_kapoor',  displayName: 'Priya Kapoor',   email: 'priya@artive.in',   bio: "Delhi-based writer. Finds poetry in Delhi's chaos." },
  { username: 'rohan_sen',     displayName: 'Rohan Sen',      email: 'rohan@artive.in',   bio: 'Assam tea garden boy. Writing between rows of green.' },
  { username: 'tara_krishna',  displayName: 'Tara Krishna',   email: 'tara@artive.in',    bio: 'Mysore painter. Every brushstroke is a verse.' },
  { username: 'vivaan_mehta',  displayName: 'Vivaan Mehta',   email: 'vivaan@artive.in',  bio: 'Ahmedabad dreamer. Kites, poetry, and monsoons.' },
  { username: 'meera_pillai',  displayName: 'Meera Pillai',   email: 'meera@artive.in',   bio: 'Kovalam coastline. The sea gives me metaphors daily.' },
  { username: 'kabir_rastogi', displayName: 'Kabir Rastogi',  email: 'kabir@artive.in',   bio: 'Lucknow nawabi arts. Ghazals and shayari in my blood.' },
];

// ── 30 Poems with rich HTML ────────────────────────────────────────────────
const POEMS = [
  {
    title: 'Monsoon Ghazal',
    tags: ['monsoon', 'rain', 'ghazal'],
    contentFull: `<strong>The first rain breaks the summer's spell, it falls like ghazal on stone</strong><br>Each drop a verse the clouds compelled, it falls like ghazal on stone<br><br>My grandmother's courtyard fills again, petrichor and memory<br><em>Neem leaves tremble, jasmine swells</em>, it falls like ghazal on stone<br><br>The city forgets its diesel hum, the kites are grounded, drowned<br>Only the peacock's cry compels, it falls like ghazal on stone<br><br><strong>I wrote your name in the courtyard dust, the rain erased it clean</strong><br>That too is love — what water tells, it falls like ghazal on stone`,
  },
  {
    title: 'Letter to the Ganga',
    tags: ['ganga', 'varanasi', 'spiritual'],
    contentFull: `<strong>You are older than our grief, Ma Ganga,</strong><br>older than the names we gave ourselves.<br><br>I have brought you marigolds and regret,<br><em>a diya lit with borrowed faith,</em><br>the ashes of three generations<br>who called your name at dawn.<br><br>The ghats remember everything.<br><strong>Every prayer floated here still ripples</strong><br>somewhere beneath the silt,<br><em>a small light refusing to drown.</em>`,
  },
  {
    title: 'Pahari Morning',
    tags: ['himalayas', 'mountains', 'dawn'],
    contentFull: `<em>At four the mountains have no colour.</em><br>Only mass. Only dark weight against dark sky.<br><br><strong>Then the peaks catch fire before anything else —</strong><br>Alpenglow, the Europeans call it.<br>We call it the gods waking up.<br><br>A shepherd passes below with twenty sheep<br>and one bell that rings like a small temple.<br><em>The mist follows him like devotion.</em><br><br>By seven, the rhododendrons are so red<br>you think the hillside is bleeding joy.`,
  },
  {
    title: 'Chai Cycle',
    tags: ['chai', 'everyday', 'urban'],
    contentFull: `<strong>Seven a.m. and Ramu bhaiya tilts the pot</strong><br>— one part milk, one part silence, two parts fire.<br><br>The bureaucrat, the beggar, the bride-to-be<br><em>all stand the same way at his stall:</em><br>palm cupped, head slightly bowed,<br>receiving morning like a benediction.<br><br>Cardamom, ginger, tea-dust so fine<br>it floats above the cup like prayer smoke.<br><strong>This is India's democracy</strong> — three rupees,<br>one kullad, everything equal in the steam.`,
  },
  {
    title: "My Ajji's Hands",
    tags: ['family', 'grandmother', 'memory'],
    contentFull: `<em>Ajji's hands knew things her mouth never said.</em><br><br>They knew the difference between<br><strong>too much salt and just enough grief,</strong><br>how to braid a girl's hair<br>without pulling her tears out,<br>how to fold a sari around a life<br>that kept almost unwinding.<br><br>At ninety-two those hands still pressed<br><em>three pinches of turmeric into the dal,</em><br>still knew which prayer to murmur<br>over which forehead at dawn.<br><br><strong>I have her knuckles now.</strong> I'm learning.`,
  },
  {
    title: 'Autorickshaw Elegy',
    tags: ['city', 'urban', 'nostalgia'],
    contentFull: `<strong>He has a Ganesha above the meter</strong><br>and a Bollywood heroine on the hood<br>and twenty years of Mumbai air<br><em>cured into his lungs like mango pickle.</em><br><br>He doesn't drive so much as negotiate —<br><strong>with traffic, with fate, with the algorithm</strong><br>that now routes his rides and rates his stars.<br><br>At the signal he turns and says,<br><em>Didi, you look like you carry heavy things.</em><br><br>I do not tell him he is right.<br>I watch the city slide by like a reel<br><strong>neither of us chose</strong> but both call home.`,
  },
  {
    title: 'Kolkata Rain',
    tags: ['kolkata', 'rain', 'nostalgia'],
    contentFull: `<em>In Kolkata the rain has a literary opinion.</em><br>It falls on Tagore's house with extra tenderness,<br><strong>skips the politician's balcony entirely.</strong><br><br>The trams move through the downpour<br>like patient, orange thoughts,<br><em>their bells announcing something no one can name.</em><br><br>Book-stalls on College Street wrap their spines<br>in plastic. A boy runs through a puddle<br><strong>as if joy were something you could step into.</strong><br><br>Perhaps it is. Perhaps that is<br>the only philosophy Bengal ever needed.`,
  },
  {
    title: 'The Weaver of Varanasi',
    tags: ['varanasi', 'craft', 'silk'],
    contentFull: `<strong>He is older than the loom but younger than the pattern.</strong><br><br>His great-grandfather's hands are in this<br><em>Banarasi silk — the cartouche border,</em><br>the gold thread that catches sunset<br>and holds it prisoner inside the cloth.<br><br>Every morning he sits before the wooden frame<br><strong>like a monk before a mandala,</strong><br>each shuttle throw a small prayer<br>in a language only shuttles understand.<br><br><em>He earns two hundred rupees for a week's work.</em><br>The sari sells in Delhi for thirty thousand.<br>He doesn't know this. Or maybe he does<br><strong>and has found a name for it that isn't anger.</strong>`,
  },
  {
    title: 'Holi Morning, Mathura',
    tags: ['holi', 'festival', 'colour'],
    contentFull: `<strong>Before the colours, there is always this —</strong><br>the cold blue hour before sunrise,<br>the priest in the temple courtyard<br><em>lighting a flame the wind tries to take.</em><br><br>Then the drums begin. Then the children.<br><strong>Then the pink and the violet and the impossible yellow</strong><br>that only exists on this day, in this town.<br><br>By noon I do not know my own face<br>in the mirror. By evening<br><em>I understand why the gods loved disguise —</em><br>to be unrecognizable is its own kind of freedom.`,
  },
  {
    title: "Fisherman's Daughter, Kanyakumari",
    tags: ['sea', 'kanyakumari', 'coast'],
    contentFull: `<em>Three seas meet here and she stands at the point</em><br>like the punctuation between them.<br><br><strong>Her father smells of salt and diesel and gone,</strong><br>out before dark, back after dark,<br>a man who loves by subtraction — takes nothing,<br><em>leaves only tide marks on the door.</em><br><br>She has learned to read weather from the skin of water,<br>to know which waves carry fish<br>and which carry grief.<br><br><strong>At sixteen she knows more about uncertainty</strong><br>than most philosophers at eighty.<br>She calls it Tuesday.`,
  },
  {
    title: 'Rajasthani Twilight',
    tags: ['rajasthan', 'desert', 'sunset'],
    contentFull: `<strong>The desert turns copper at five,</strong><br>purple at six, and then<br><em>a colour the Mewari painters invented</em><br>that Europeans have no word for.<br><br>The camel walks like a comma<br>in a sentence the dunes are composing.<br><strong>The sentence has been going on since the Thar began</strong><br>and has not finished.<br><br>A woman fills her matka at the well.<br><em>The walk back is three kilometres</em><br>and she makes it beautiful with her gait,<br>the way she balances the world<br><strong>without spilling a drop.</strong>`,
  },
  {
    title: 'Midnight Kitchen, Delhi',
    tags: ['delhi', 'food', 'night'],
    contentFull: `<em>At two a.m. the dhabha near Jama Masjid</em><br>is at its best: half Delhi sleeps,<br>the other half is hungry and honest about it.<br><br><strong>The nihari has been cooking since midnight yesterday.</strong><br>Twelve hours is the minimum for this kind of love —<br>slow, bone-deep, unapologetic.<br><br>The cook knows three languages<br><em>and speaks only in ladles.</em><br>His grandmother's recipe lives<br>in the movement of his wrist alone,<br><strong>nowhere written, impossible to steal.</strong>`,
  },
  {
    title: 'Jasmine Season',
    tags: ['flowers', 'memory', 'south india'],
    contentFull: `<strong>In summer my mother string-threaded jasmine</strong><br>before the sun rose, before we woke,<br>so the house smelled like answered prayers<br><em>by breakfast.</em><br><br>Forty rupees a bundle in the market now.<br>She would have called that a scandal<br>and bought two bundles anyway,<br><strong>because beauty was never meant to be practical.</strong><br><br>I keep one flower in my desk sometimes —<br>a full week past its life it still<br><em>smells faintly of that kitchen,</em><br>that woman, that small careful love<br><strong>that preceded everything.</strong>`,
  },
  {
    title: "Rickshaw Wallah's Daughter",
    tags: ['family', 'hope', 'india'],
    contentFull: `<em>She studies by the lamppost</em><br>while he pedals. This is the arrangement.<br><br><strong>The lamp burns from eight to eleven,</strong><br>which is enough for history and mathematics<br>but not quite enough for chemistry —<br><em>the textbook has diagrams that need daylight.</em><br><br>Her mother knows where every exam centre is<br>in three districts. She has walked<br>to five of them to confirm the route herself.<br><br><strong>They are building something so large</strong><br>it will not fit in the lane where they live.<br>This is understood, and they are building anyway.`,
  },
  {
    title: 'Banyan Meditation',
    tags: ['nature', 'tree', 'philosophy'],
    contentFull: `<strong>The banyan does not grow so much as remember.</strong><br><br>Each aerial root a thought it lowered<br><em>to find the ground again,</em><br>each branch a question the original trunk<br>asked and then answered with itself.<br><br>Under a banyan like this one<br><strong>armies rested, saints arrived at conclusions,</strong><br>lovers made promises the tree outlasted.<br><br><em>The tree holds all of this</em><br>and asks nothing back —<br>not the army, not the saint,<br>not the lovers whose names<br><strong>are less permanent than its smallest root.</strong>`,
  },
  {
    title: "My Father's Handwriting",
    tags: ['family', 'memory', 'writing'],
    contentFull: `<em>He wrote with the pen held at an angle</em><br>like a man always slightly uncertain<br>of the next word.<br><br><strong>The letters leaned together like friends at a bus stop,</strong><br>each one supporting the next,<br>none perfectly upright but the whole line<br><em>somehow arriving where it meant to go.</em><br><br>He is eighty now and the pen<br>shakes but the angle is the same —<br><strong>that slight tilt of hope,</strong><br>as if the next sentence<br>is the one that finally explains everything.`,
  },
  {
    title: 'Durga Puja Eve',
    tags: ['durga puja', 'kolkata', 'festival'],
    contentFull: `<strong>She arrives on a cloud of drums,</strong><br>the whole city holding its breath<br>and then releasing it as one voice.<br><br><em>For five days Kolkata forgets its rent,</em><br>its traffic, its ancient political grudges —<br>forgets everything except the goddess<br>with ten arms and one compassion.<br><br><strong>The pandals are cities inside cities,</strong><br>artists spent six months making this hour possible.<br><em>The crowd walks through light</em><br>like they're inside a dream<br>they're too awake to leave.`,
  },
  {
    title: 'Tea Garden Letter',
    tags: ['assam', 'tea', 'nature'],
    contentFull: `<em>I am writing from the garden</em><br>where the first flush is still six weeks away<br>and the bushes stand in February fog<br><strong>like an audience waiting for something extraordinary.</strong><br><br>The pluckers come at six.<br>Their baskets grow heavy by noon<br>with <em>the two-leaves-and-a-bud perfection</em><br>that becomes somebody else's morning ritual<br>on the other side of the world.<br><br><strong>What is it to be transformed like that —</strong><br>leaf to liquid, garden to cup,<br><em>this hillside to someone's quiet hour</em><br>ten thousand kilometres away?`,
  },
  {
    title: 'Sitar String',
    tags: ['music', 'sitar', 'classical'],
    contentFull: `<strong>The raga begins before the first note,</strong><br>in the tuning, in the pause,<br><em>in the way the ustad closes his eyes</em><br>and searches for a room<br>that exists only inside the sound.<br><br>Alap: no hurry, no audience, only<br>the slow unveiling of a world<br><strong>that has been waiting since sunrise to be found.</strong><br><br><em>By the jhala the night is certain.</em><br>Every note lands like rain on a dry field.<br>The listeners don't clap so much as<br><strong>breathe out together,</strong><br>relieved to have witnessed something true.`,
  },
  {
    title: 'Jaisalmer Night',
    tags: ['jaisalmer', 'desert', 'stars'],
    contentFull: `<em>There is no light pollution here,</em><br>just light — the original kind,<br>unfiltered, unafraid, falling<br><strong>from distances that make grief feel small.</strong><br><br>The sand is cold by midnight.<br>The scorpion moves like a punctuation mark<br><em>between the grains.</em><br><br>Above: the Milky Way is so clear<br>you understand for the first time<br>why ancient people built entire mythologies<br><strong>out of something they couldn't reach.</strong><br><em>Hope always requires distance.</em>`,
  },
  {
    title: 'Mango Season',
    tags: ['mango', 'summer', 'childhood'],
    contentFull: `<strong>The mango tree in Nana's garden</strong><br>had its own calendar,<br>its own slow economy of blossom and wait.<br><br>May was the month of fingers sticky<br><em>with Alphonso logic:</em><br>you eat until you cannot,<br>then you eat two more.<br><br><strong>The juice ran down wrists and was never caught.</strong><br>This was the instruction.<br><em>Summer's only lesson:</em><br>some sweetness is too quick for manners<br>and must be received entirely,<br><strong>without grace, without a plate.</strong>`,
  },
  {
    title: 'Dhobi Ghat',
    tags: ['mumbai', 'labour', 'water'],
    contentFull: `<em>A thousand families' Monday mornings</em><br>arrive here by six a.m.,<br>everything unwashed, everything waiting.<br><br><strong>The dhobis work in a river of cloth,</strong><br>slapping linen against stone<br>with an authority that says:<br><em>I know how to remove what you cannot face.</em><br><br>Hotel sheets, hospital gowns,<br>the bride's dowry silk, the widower's kurta —<br><strong>all treated with the same democratic force,</strong><br>all returned clean,<br><em>all carrying a ghost of the stone's memory.</em>`,
  },
  {
    title: 'Rickshaw to Chandni Chowk',
    tags: ['old delhi', 'chaos', 'life'],
    contentFull: `<strong>To enter Chandni Chowk is to give up certainty.</strong><br><br>The lanes narrow as they remember,<br><em>each gali holding six centuries</em><br>and a paratha shop that opens at four a.m.<br>for no clear reason except hunger is no respecter of dawn.<br><br>A wedding procession passes a funeral.<br><strong>Both bands play.</strong> Neither stops.<br><em>Someone sells marigolds to both.</em><br><br>The city has decided that everything<br>can happen at the same time<br>and this is not chaos —<br><strong>it is a different kind of order.</strong>`,
  },
  {
    title: 'Birdsong at Bharatpur',
    tags: ['birds', 'nature', 'poetry'],
    contentFull: `<em>Five a.m. and the painted stork stands</em><br>in exactly three inches of water<br>with the patience of a monk<br><strong>who has already attained what he came for</strong><br>and simply hasn't moved yet.<br><br>The purple sunbird announces morning<br>in seven notes, repeats it,<br><em>considers revisions.</em><br><br><strong>Thirty thousand birds, one marsh,</strong><br>the season brief as all good things are —<br>November to February,<br><em>then the cranes leave for Siberia</em><br>and we are left to remember<br><strong>how loud silence is after.</strong>`,
  },
  {
    title: 'Paan Wallah Philosophy',
    tags: ['street', 'philosophy', 'everyday'],
    contentFull: `<strong>He has made one thing for forty years.</strong><br><em>This is mastery. This is a life.</em><br><br>The betel leaf chosen for firmness,<br>the lime applied like an argument<br>that both sides of your mouth will agree with,<br><strong>the gulkand placed at the centre</strong><br>where sweetness should always be —<br><em>not at the edges where it gets lost.</em><br><br>He folds the paan in three moves<br>he has made four million times.<br><strong>The fold is perfect.</strong><br>It was always perfect.<br><em>Practice isn't how you improve;</em><br>it's how you remember<br>what you already know.`,
  },
  {
    title: "Grandmother's Radio",
    tags: ['radio', 'nostalgia', 'family'],
    contentFull: `<em>The HMV radio was older than independence,</em><br>or it felt that way in the green half-light<br>of Nani's room in Lucknow summers.<br><br><strong>Binaca Geetmala on Wednesdays.</strong><br>She would not speak. She would not move.<br><em>The singers arrived from somewhere beyond the static</em><br>and she received them like guests<br>more important than anyone who'd actually arrived.<br><br>After, she would make us tea<br>and hum the last song<br><strong>all the way into the next week,</strong><br>carrying it like something<br><em>too valuable to put down.</em>`,
  },
  {
    title: 'Paddy Field at Dusk',
    tags: ['kerala', 'paddy', 'nature'],
    contentFull: `<strong>The paddy field at dusk is a mirror</strong><br>the sky made for itself<br>to see how beautiful it looks<br><em>when it isn't trying.</em><br><br>Egrets wade through reflection.<br>They are white twice — above, below —<br><strong>doubled in the water like a good memory</strong><br>that improves with telling.<br><br>The paddy bends in the wind<br><em>all in one direction,</em><br>a thousand stalks agreeing<br>on something we haven't asked yet.<br><strong>This is what consensus looks like</strong><br>before language ruins it.`,
  },
  {
    title: 'Azan Before Sunrise',
    tags: ['dawn', 'spiritual', 'india'],
    contentFull: `<strong>The muezzin's voice carries in winter</strong><br>further than in summer —<br>cold air holds sound better,<br><em>the way grief holds detail.</em><br><br>Four thirty and the lane is still dark<br>but the call has found every window.<br><strong>The Hindu neighbour turns in sleep.</strong><br><em>The child does not wake.</em><br>The old woman on the third floor<br>is already awake and receives the sound<br>the way she receives everything good —<br><strong>with both hands, with the face</strong><br>she makes only when no one is watching.`,
  },
  {
    title: 'Houseboat, Dal Lake',
    tags: ['kashmir', 'water', 'peace'],
    contentFull: `<em>The houseboat is called "New Heaven."</em><br>The old heaven, presumably, has a waiting list.<br><br><strong>We wake to shikaras moving through mist</strong><br>with lotus flowers and breakfast and a man<br>who knows twelve words in seven languages<br>and uses them all to say good morning<br><em>in a way that sounds like a complete education.</em><br><br>The lake is a held breath.<br>The mountains do not move.<br><strong>The kingfisher moves like a blue decision</strong><br>and is gone before you name it.<br><em>Some things are only real</em><br>in the moment of arrival.`,
  },
  {
    title: 'Chaat and Consequence',
    tags: ['food', 'street food', 'delhi'],
    contentFull: `<strong>The panipuri arrives as a sentence</strong><br>that must be finished in one word:<br>whole, undivided, before it breaks.<br><br><em>The tamarind water is a full argument</em><br>— sour, sweet, spiced beyond apology —<br>and the mouth must answer it<br><strong>before the mind has time to refuse.</strong><br><br>This is the genius: the instruction is implicit.<br><em>You cannot be polite. You cannot be small.</em><br>You can only open entirely<br>to this moment, this flavour,<br><strong>this very specific kind of joy</strong><br>that has been costing seven rupees per piece<br><em>and is still the best deal in the city.</em>`,
  },
];

// ── 50 Visual Seeds ─────────────────────────────────────────────────────────
// Plain text descriptions — NO HTML, the visual card renders these as-is
const VISUAL_SEEDS = [
  { title: 'Golden Hour over the Thar', tags: ['rajasthan', 'desert', 'photography'], picsumId: 11, desc: 'The desert light at dusk has a quality found nowhere else — amber, ancient, and slow.' },
  { title: 'Backwaters at First Light', tags: ['kerala', 'backwaters', 'dawn'], picsumId: 13, desc: 'A lone boat glides through the Alappuzha backwaters before the rest of the world has remembered to wake.' },
  { title: 'Varanasi Ghat Reflection', tags: ['varanasi', 'ganga', 'ritual'], picsumId: 14, desc: 'The ghats of Varanasi hold every emotion simultaneously — grief, celebration, and the strange peace between them.' },
  { title: 'Monsoon Clouds, Western Ghats', tags: ['monsoon', 'clouds', 'nature'], picsumId: 17, desc: 'When the monsoon clouds arrive over the Ghats, the air smells like the beginning of everything.' },
  { title: 'Market Marigolds', tags: ['flowers', 'market', 'colour'], picsumId: 20, desc: 'A flower vendor at Dadar market, 5am. Ten thousand marigolds waiting to become offerings.' },
  { title: 'Himalayan Trek Path', tags: ['himalayas', 'trek', 'mountains'], picsumId: 21, desc: 'The trail above Kheerganga. Every step takes you further from the version of yourself that needs WiFi.' },
  { title: 'Ancient Stepwell, Gujarat', tags: ['architecture', 'gujarat', 'heritage'], picsumId: 24, desc: 'The Rani ki Vav stepwell descends into water and myth simultaneously.' },
  { title: 'Fishermen, Kochi Coast', tags: ['kochi', 'fishing', 'sea'], picsumId: 27, desc: 'The Chinese fishing nets of Kochi are lowered at dusk and raised again at dawn, always patient.' },
  { title: 'Sundarbans Morning', tags: ['sundarbans', 'mangrove', 'bengal'], picsumId: 29, desc: 'In the Sundarbans the trees grow out of water and the water grows out of everything else.' },
  { title: 'Holi Colour Burst', tags: ['holi', 'colour', 'festival'], picsumId: 30, desc: 'For exactly one day a year, colour has permission to go everywhere.' },
  { title: 'Fort Amber at Twilight', tags: ['rajasthan', 'fort', 'history'], picsumId: 33, desc: 'Amber Fort does not so much stand in the hills as become them.' },
  { title: 'Darjeeling Tea Garden', tags: ['darjeeling', 'tea', 'hills'], picsumId: 36, desc: "The tea bushes go on forever in every direction. Somewhere in this green infinity is the cup you'll drink tomorrow." },
  { title: 'Silk Weavers of Kanchipuram', tags: ['silk', 'weaving', 'craft'], picsumId: 37, desc: 'Three thousand threads. One pattern that took six months to design.' },
  { title: 'Rann of Kutch, White Desert', tags: ['kutch', 'salt', 'desert'], picsumId: 39, desc: 'On a full moon night, the Rann is entirely white and entirely silent. You forget you are on Earth.' },
  { title: 'Chasing Light, Meghalaya', tags: ['meghalaya', 'northeast', 'mist'], picsumId: 40, desc: 'Cherrapunji on a clear day — fifteen minutes of clarity before the next cloud consumes everything.' },
  { title: 'Street in Jodhpur, Blue City', tags: ['jodhpur', 'blue', 'architecture'], picsumId: 42, desc: 'Every shade of blue in Jodhpur is different. Every shade is correct.' },
  { title: 'Elephants at Periyar', tags: ['kerala', 'elephants', 'wildlife'], picsumId: 45, desc: 'At the Periyar lake edge, five elephants drinking. The water barely moves for them.' },
  { title: 'Old Delhi Haveli Detail', tags: ['old delhi', 'haveli', 'heritage'], picsumId: 48, desc: 'A forgotten jali window in a Shahjahanabad haveli. The light remembers how to pour through it.' },
  { title: 'Sunrise, Kanyakumari', tags: ['kanyakumari', 'sunrise', 'sea'], picsumId: 50, desc: 'Three seas and one sky, and the sun rising exactly where they all meet.' },
  { title: 'Paddy Harvest, Orissa', tags: ['orissa', 'harvest', 'rural'], picsumId: 53, desc: 'The women of this village have harvested this field every October for four generations.' },
  { title: 'Jaipur Block Print Workshop', tags: ['jaipur', 'craft', 'colour'], picsumId: 55, desc: 'A block print workshop at 7am. Pattern accumulates slowly. Every print slightly different from the last.' },
  { title: 'Mangroves of Sundarbans', tags: ['mangroves', 'nature', 'roots'], picsumId: 58, desc: 'The mangrove roots hold the delta together. Remove them and the land begins to forget itself.' },
  { title: 'Vrindavan Temple at Dusk', tags: ['vrindavan', 'temple', 'devotion'], picsumId: 60, desc: "The bells begin at sunset and don't stop until the sky is fully dark." },
  { title: 'Rock Garden, Chandigarh', tags: ['chandigarh', 'art', 'sculpture'], picsumId: 62, desc: 'Nek Chand built a garden from industrial waste and refused to call it art. It is art.' },
  { title: 'Konark Sun Temple Detail', tags: ['konark', 'temple', 'orissa'], picsumId: 64, desc: 'The stone chariot wheels of Konark have been marking time since 1250 CE.' },
  { title: 'Mawlynnong Village, Meghalaya', tags: ['meghalaya', 'village', 'northeast'], picsumId: 67, desc: "Asia's cleanest village. The bamboo dustbins are more beautiful than most art." },
  { title: 'Fishing Boats, Goa', tags: ['goa', 'fishing', 'boats'], picsumId: 70, desc: 'The painted fishing boats of Goa are tied up at noon. They work the edges of the day.' },
  { title: 'Ladakh Night Sky', tags: ['ladakh', 'stars', 'night'], picsumId: 73, desc: 'At 3500 metres the stars are not points. They are presences.' },
  { title: 'Haveli Courtyard, Shekhawati', tags: ['shekhawati', 'haveli', 'fresco'], picsumId: 75, desc: "A merchant's courtyard in Shekhawati. The frescoes on every wall told stories the merchant paid for and then forgot." },
  { title: 'Monks in Spiti Valley', tags: ['spiti', 'monks', 'himalayas'], picsumId: 77, desc: 'At 4166 metres, the Key Monastery has been here longer than the current political arrangement of this land.' },
  { title: 'Pushkar Camel Fair', tags: ['pushkar', 'camel', 'rajasthan'], picsumId: 79, desc: 'The Pushkar Camel Fair: fifty thousand camels, a hundred thousand humans, and a negotiation that has never truly ended.' },
  { title: 'Onam Pookalam', tags: ['onam', 'flower', 'kerala'], picsumId: 82, desc: 'The pookalam takes three hours to make and one gust of wind to undo. This is understood and accepted.' },
  { title: 'Bamboo Bridge, Meghalaya', tags: ['meghalaya', 'bamboo', 'northeast'], picsumId: 85, desc: 'The living root bridges of Cherrapunji are grown, not built. They improve with age, unlike most things.' },
  { title: 'Calcutta Tram at Night', tags: ['kolkata', 'tram', 'nostalgia'], picsumId: 88, desc: "The last of Kolkata's trams run through the night. They move slowly, as if reluctant to arrive anywhere and end." },
  { title: 'Rangoli, Diwali Morning', tags: ['diwali', 'rangoli', 'festival'], picsumId: 91, desc: 'Made at dawn, walked over by noon, swept away by evening. The impermanence is the point.' },
  { title: 'Hampi Ruins at Sunset', tags: ['hampi', 'ruins', 'karnataka'], picsumId: 94, desc: 'The Vijayanagara empire collapsed in a single battle. The stones are still working out what happened.' },
  { title: 'Coorg Coffee Estate', tags: ['coorg', 'coffee', 'karnataka'], picsumId: 97, desc: 'A coffee estate in Coorg at 5am. The mist and the caffeine arrive simultaneously.' },
  { title: 'Ahmedabad Pol House', tags: ['ahmedabad', 'architecture', 'gujarat'], picsumId: 100, desc: 'The wooden facades of the pol houses in old Ahmedabad carry carvings that no one pays to see.' },
  { title: 'Boat Race, Alleppey', tags: ['alleppey', 'boat race', 'kerala'], picsumId: 103, desc: 'The Nehru Trophy boat race: a hundred oarsmen moving as one body through green water.' },
  { title: 'Orchid, Northeast India', tags: ['orchid', 'flower', 'northeast'], picsumId: 106, desc: 'Manipur has over 500 species of orchid. This one has no name in any language I know.' },
  { title: 'Charminar at Dusk, Hyderabad', tags: ['hyderabad', 'charminar', 'heritage'], picsumId: 109, desc: 'Charminar has watched four hundred years of Hyderabad. It has an opinion. It keeps it.' },
  { title: 'Spice Market, Kochi', tags: ['kochi', 'spices', 'market'], picsumId: 112, desc: 'A spice warehouse in Mattancherry. The air is so saturated with cardamom you can chew it.' },
  { title: 'Sunrise Yoga, Rishikesh', tags: ['rishikesh', 'yoga', 'ganga'], picsumId: 115, desc: 'Six a.m. on the ghats of Rishikesh. The Ganga is cold. The posture is imperfect. The moment is exact.' },
  { title: 'Jaisalmer Sandcastle City', tags: ['jaisalmer', 'fort', 'rajasthan'], picsumId: 118, desc: 'Built from the same stone as the desert. At distance you cannot see where the fort ends and the Thar begins.' },
  { title: 'Kodaikanal Mist', tags: ['kodaikanal', 'hill station', 'tamilnadu'], picsumId: 121, desc: "In Kodaikanal the mist doesn't lift. It just moves from one place to another, keeping secrets." },
  { title: 'Kerala Kathakali Close-up', tags: ['kathakali', 'dance', 'kerala'], picsumId: 124, desc: 'The kathakali makeup takes four hours to apply. The performance is three hours. The face remembers six hours.' },
  { title: 'Tribal Art, Bastar', tags: ['bastar', 'tribal', 'chhattisgarh'], picsumId: 127, desc: 'Bastar dhokra craft: lost-wax bronze casting that has been practised here for 4000 years without instruction manuals.' },
  { title: 'Victoria Memorial, Monsoon', tags: ['kolkata', 'monument', 'monsoon'], picsumId: 130, desc: "The Victoria Memorial in July rain looks like it's remembering something it would rather forget." },
  { title: 'Gond Painting Fragment', tags: ['gond', 'painting', 'madhya pradesh'], picsumId: 133, desc: 'A detail from a Gond painting. Every dot is deliberate. The entire cosmology is in the pattern.' },
  { title: 'Sunset, Rameswaram Bridge', tags: ['rameswaram', 'bridge', 'sea'], picsumId: 136, desc: 'Pamban Bridge, Rameswaram. The sea on both sides. The horizon on all sides.' },
];

// Fork response texts
const FORK_TEXTS = [
  (t) => `<em>Responding to "${t}"...</em><br><br><strong>What you left unsaid in your verse</strong> lives in the white space between your lines. I am planting a seed there.<br><br>The water remembers what the stone forgets.`,
  (t) => `I read "${t}" three times before I could answer.<br><br><strong>The third reading is always the truest.</strong><br><em>You had built something I had to walk around</em> before I could find the door.<br><br>Here is what I found when I went inside.`,
  (t) => `<strong>Your image stays with me</strong> — I keep returning to it the way you return to a place you once belonged.<br><br><em>This is my version of the same longing,</em> from a different direction.`,
  (t) => `A fork because I couldn't let it go.<br><br><strong>You opened a window</strong><br><em>I needed to climb through.</em><br><br>What I found on the other side is this poem.`,
  (t) => `<em>I don't agree with your ending</em> — not because it's wrong, but because mine is different.<br><br><strong>Two people can look at the same river</strong> and tell a story about it in entirely opposite directions.<br>Both rivers are real.`,
  (t) => `Reading this felt like finding a photograph<br>of a place I've never been<br><em>but recognise anyway.</em><br><br><strong>Memory doesn't always need direct experience.</strong> Sometimes it just needs permission.`,
  (t) => `<strong>You carried the weight of this poem</strong><br>to somewhere I couldn't follow —<br>so I started a parallel path.<br><br><em>Maybe they converge somewhere ahead.</em>`,
  (t) => `This fork is an argument and an agreement simultaneously.<br><br><strong>I take your starting point</strong><br><em>and walk north instead of south.</em><br><br>Tell me what you see from your direction.`,
];

// ─── Utilities ─────────────────────────────────────────────────────────────

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const copy = [...arr]; const result = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Interleave two arrays so they appear mixed (not all from one then all from other)
function interleave(arr1, arr2) {
  const result = [];
  const a = shuffle([...arr1]);
  const b = shuffle([...arr2]);
  let i = 0, j = 0;
  // Roughly 60/40 interleaving by adding chunks
  while (i < a.length || j < b.length) {
    // Add 1-2 from a
    const chunkA = randInt(1, 2);
    for (let k = 0; k < chunkA && i < a.length; k++, i++) result.push(a[i]);
    // Add 1-2 from b
    const chunkB = randInt(1, 2);
    for (let k = 0; k < chunkB && j < b.length; k++, j++) result.push(b[j]);
  }
  return result;
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const uri = (process.env.MONGO_URI || '').trim();
  if (!uri) { console.error('MONGO_URI not set'); process.exit(1); }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected.\n');

  // ── 0. Wipe existing data ──
  console.log('🗑️  Clearing existing data...');
  await Lineage.deleteMany({});
  await Fork.deleteMany({});
  await Seed.deleteMany({});
  await User.deleteMany({ username: { $in: SEED_USERNAMES } });
  console.log('  Done.\n');

  // ── 1. Create users ──
  console.log('👥 Creating users...');
  const passwordHash = await bcrypt.hash('artive2024', 10);
  const userDocs = [];
  for (const u of USERS) {
    const doc = await User.create({ ...u, passwordHash });
    userDocs.push(doc);
    console.log(`  ✅ ${u.displayName}`);
  }

  // ── 2. Build interleaved creation list ──
  // Tag each entry with its type so we create them in mixed order
  const poemEntries = POEMS.map(p => ({ kind: 'poem', data: p }));
  const visualEntries = VISUAL_SEEDS.map(v => ({ kind: 'visual', data: v }));
  const creationOrder = interleave(poemEntries, visualEntries);

  console.log(`\n🌱 Creating ${creationOrder.length} seeds (interleaved)...`);
  const poemDocs = [];
  const visualDocs = [];

  for (const entry of creationOrder) {
    const author = pick(userDocs);
    if (entry.kind === 'poem') {
      const p = entry.data;
      const snippet = p.contentFull.replace(/<[^>]+>/g, '').slice(0, 300);
      const doc = await Seed.create({
        title: p.title,
        contentSnippet: snippet,
        contentFull: p.contentFull,
        type: 'poem',
        author: author._id,
        tags: p.tags,
        forkCount: 0,
        likes: randInt(2, 60),
      });
      poemDocs.push(doc);
      console.log(`  📝 ${p.title}`);
    } else {
      const v = entry.data;
      const imageUrl = `https://picsum.photos/id/${v.picsumId}/800/600`;
      const thumbUrl = `https://picsum.photos/id/${v.picsumId}/400/300`;
      const doc = await Seed.create({
        title: v.title,
        contentSnippet: v.desc,  // plain text — no HTML
        contentFull: v.desc,     // plain text — no HTML
        type: 'visual',
        author: author._id,
        tags: v.tags,
        thumbnailUrl: thumbUrl,
        forkCount: 0,
        likes: randInt(5, 90),
      });
      visualDocs.push(doc);
      console.log(`  🖼️  ${v.title}`);
    }
  }

  const allSeeds = [...poemDocs, ...visualDocs];

  // ── 3. Build fork tree ──
  // Distribution:
  //   5 seeds → deep trees  (11-17 forks, depth 3)
  //  10 seeds → medium trees (4-8 forks, depth 2)
  //  20 seeds → light trees  (1-3 forks, depth 1)
  //  rest    → no forks

  console.log('\n🌿 Building fork tree...');
  const shuffledSeeds = shuffle([...allSeeds]);
  const deepSeeds   = shuffledSeeds.slice(0, 5);
  const mediumSeeds = shuffledSeeds.slice(5, 15);
  const lightSeeds  = shuffledSeeds.slice(15, 35);

  async function makeFork(parentId, rootSeedId, depth) {
    const author = pick(userDocs);
    const rootSeed = allSeeds.find(s => String(s._id) === String(rootSeedId));
    const text = pick(FORK_TEXTS)(rootSeed ? rootSeed.title : 'the original');
    const fork = await Fork.create({
      parentSeed: parentId,
      author: author._id,
      contentDelta: text,
      forkCount: 0,
    });
    return fork;
  }

  for (const seed of deepSeeds) {
    const rootId = seed._id;
    const numDirect = randInt(3, 5);
    const directForks = [];
    for (let i = 0; i < numDirect; i++) directForks.push(await makeFork(rootId, rootId, 1));
    for (const df of pickN(directForks, randInt(2, 3))) {
      const l2 = [];
      for (let i = 0; i < randInt(2, 3); i++) l2.push(await makeFork(df._id, rootId, 2));
      if (l2.length) for (let i = 0; i < randInt(1, 2); i++) await makeFork(pick(l2)._id, rootId, 3);
    }
    console.log(`  🌲 Deep tree: ${seed.title}`);
  }

  for (const seed of mediumSeeds) {
    const rootId = seed._id;
    const directForks = [];
    for (let i = 0; i < randInt(2, 4); i++) directForks.push(await makeFork(rootId, rootId, 1));
    for (const df of pickN(directForks, randInt(1, 2)))
      for (let i = 0; i < randInt(1, 2); i++) await makeFork(df._id, rootId, 2);
    console.log(`  🌿 Medium tree: ${seed.title}`);
  }

  for (const seed of lightSeeds) {
    for (let i = 0; i < randInt(1, 3); i++) await makeFork(seed._id, seed._id, 1);
    console.log(`  🌱 Light tree: ${seed.title}`);
  }

  // ── 4. Recalculate forkCounts ──
  console.log('\n🔢 Recalculating fork counts...');
  async function countDescendants(id) {
    const direct = await Fork.find({ parentSeed: id }).lean();
    let count = direct.length;
    for (const f of direct) count += await countDescendants(f._id);
    return count;
  }

  for (const seed of allSeeds) {
    const total = await countDescendants(seed._id);
    await Seed.findByIdAndUpdate(seed._id, { forkCount: total });
    if (total > 0) console.log(`  📊 ${seed.title}: ${total} forks`);
  }

  const allForks = await Fork.find({}).lean();
  for (const fork of allForks) {
    const dc = await Fork.countDocuments({ parentSeed: fork._id });
    if (dc > 0) await Fork.findByIdAndUpdate(fork._id, { forkCount: dc });
  }

  // ── 5. Build Lineage ──
  console.log('\n🌳 Building lineage records...');
  for (const seed of allSeeds) {
    const childIds = [];
    const queue = [seed._id];
    const visited = new Set();
    while (queue.length) {
      const cur = queue.shift();
      const key = String(cur);
      if (visited.has(key)) continue;
      visited.add(key);
      const children = allForks.filter(f => String(f.parentSeed) === key);
      for (const c of children) { childIds.push(c._id); queue.push(c._id); }
    }
    if (childIds.length > 0) {
      await Lineage.findOneAndUpdate(
        { seedId: seed._id },
        { seedId: seed._id, children: childIds },
        { upsert: true, new: true }
      );
    }
  }

  // ── 6. Summary ──
  const userCount    = await User.countDocuments();
  const seedCount    = await Seed.countDocuments();
  const poemCount    = await Seed.countDocuments({ type: 'poem' });
  const visualCount  = await Seed.countDocuments({ type: 'visual' });
  const forkCount    = await Fork.countDocuments();
  const lineageCount = await Lineage.countDocuments();

  console.log('\n✨ Seed complete!');
  console.log(`  👥 Users:    ${userCount}`);
  console.log(`  🌱 Seeds:    ${seedCount} (${poemCount} poems, ${visualCount} visual)`);
  console.log(`  🌿 Forks:    ${forkCount}`);
  console.log(`  🌳 Lineages: ${lineageCount}`);

  await mongoose.disconnect();
  console.log('\nDisconnected. Done.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  mongoose.disconnect();
  process.exit(1);
});
