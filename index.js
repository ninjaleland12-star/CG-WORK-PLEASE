require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// ================= CONFIG =================
const COMMAND_CHANNEL = process.env.COMMAND_CHANNEL; // where you type commands
const WARRANT_CHANNEL = process.env.WARRANT_CHANNEL; // channel to post warrants
const BOUNTY_CHANNEL = process.env.BOUNTY_CHANNEL;   // channel to post bounties
const CASE_CHANNEL = process.env.CASE_CHANNEL;       // warrant file/archive channel

const REAL_WARRANT_TIME = 259200000; // 4 years in ms until Boutny hunters are implented
const TEST_WARRANT_TIME = 15000;     // 15 seconds test

// ================= LAW BOOK =================

const lawBook = {
    // SECTION I — PURPOSE AND JURISDICTION
    "1.1": "Enforcement Authority — Applies across all Republic installations, vessels, divisions, and digital command networks. Articles IV and V remain active and supersede local or battalion statutes.",
    "1.2": "Procedural Mandate — No subject shall face punishment without investigation by certified RI adjudicators unless directly witnessed. All investigative materials remain classified.",
    "1.3": "Penalty Provisions — Sentencing severity depends on context, cooperation, and recurrence. Infractions by High Command incur double penalties; Council Members triple.",
    "1.4": "Command Accountability — All disciplinary reports are transmitted to the accused’s commanding officer. Evasion results in removal or possible banishment.",
    "1.5": "Progressive Discipline Clause — Repeated minor infractions may escalate into major classification at Tribunal discretion.",
    "1.6": "Emergency Authority Clause — High Command may temporarily suspend procedures during active raids or instability (not punishable).",

    // SECTION II — CONDUCT OF MILITARY PERSONNEL AND CIVILIANS
    "2.1": "Insubordination — Refusing lawful orders from superiors. (10 minutes)",
    "2.2": "Desertion / Abandoning Post — Leaving duty or post without authorization. (5–10 minutes)",
    "2.3": "Dereliction of Duty — Neglecting assigned tasks or responsibilities. (5–10 minutes)",
    "2.4": "Unauthorized Equipment Possession — Using or possessing restricted Republic arms or armor. (10 minutes; time starts after surrendering equipment)",
    "2.5": "Intentional Use of Incorrect Weaponry — Using uncertified or unauthorized weapons (“Use your certs”). (7 minutes)",
    "2.6": "Unauthorized Dual-Wielding — Wielding multiple weapons without clearance. (5 minutes)",
    "2.7": "Misuse of Collars — Improper or abusive use of detainment collars. (5–10 minutes)",
    "2.8": "Misuse of Intercom — Abusing communication systems for non-mission use. (5 minutes)",
    "2.9": "Disorderly Conduct — Disruptive behavior harming operational efficiency. (5–10 minutes)",
    "2.10": "Failure to Follow Avatar Height Laws — Violating height requirements. (5 minutes)",
    "2.11": "Failure to Comply with Military Orders — Refusal or neglect of direct instruction. (5–10 minutes)",
    "2.12": "Bribery — Offering or accepting favors to influence duty or outcome. (5 minutes)",
    "2.13": "Self-Promotion of Other Groups — Advertising external organizations without clearance. (5 minutes)",
    "2.14": "Tampering with Other Troopers’ or Core Equipment — Unauthorized modifications or interference. (5 minutes)",
    "2.15": "Loitering (Restricted/Operational Areas) — Being idle in or near restricted zones without purpose. (5–10 minutes)",
    "2.16": "Conflict of Interest Disclosure — Failure to disclose leadership roles, alliances, or affiliations. (5–10 minutes)",
    "2.17": "Chain of Command Bypass — Bypassing intermediate command levels for non-emergency matters without justification. (5–10 minutes)",
    "2.18": "Unauthorized Command Assumption — Assuming operational control without proper delegation or rank authority. (10 minutes)",
    "2.19": "Improper Use of Administrative Channels — Repeated unnecessary escalation to High Command or Senate. (5 minutes)",
    "2.20": "Training Sabotage — Intentional disruption of official training or certification events. (10 minutes)",
    "2.21": "Certification Fraud — Claiming qualifications, certifications, or combat specialties not officially granted. (10 minutes)",
    "2.22": "Failure to Report Security Breaches — Failing to report credible threats, infiltration attempts, or serious violations. (10 minutes)",
    "2.23": "Public Representation Misconduct — Damaging Republic reputation while publicly representing the Republic. (5–10 minutes)",
    "Uniform": "All personnel must wear the officially designated Republic uniform. Unauthorized alterations or misuse prohibited. (10–15 minutes • Strike)",

    // SECTION III — CONDUCT IN COMBAT
    "3.1": "Unauthorized Engagement — Entering combat without approval. (5–10 minutes)",
    "3.2": "Cowardice — Fleeing combat out of fear. (10 minutes)",
    "3.3": "Misuse of Equipment — Reckless or improper use of Republic machinery. (5–10 minutes)",
    "3.4": "Negligent Discharge — Accidental weapon fire. (5 minutes)",
    "3.5": "Flagging — Unsafe weapon handling aimed at allies.",
    "3.6": "Friendly Fire — Injuring or killing Republic allies by negligence. (10 minutes)",
    "3.7": "Murder / Killing Republic Personnel — Intentional killing of Republic members. (5–10 minutes)",
    "3.8": "Killing Republic Personnel as Republic — Murder by active Republic forces. (10 minutes)",
    "3.9": "Murder (Civilian on Civilian) — Killing another civilian. (5 minutes)",
    "3.10": "Raiding (Unauthorized or Mass) — Participating in unauthorized assault. (5–10 minutes)",
    "3.11": "Raiding with Lightsaber (Identified as Sith) — Unauthorized raid using lightsabers. (5 minutes)",
    "3.12": "Shooting into Spawn or Safe Zones — Firing into protected areas. (7–10 minutes)",
    "3.13": "Theft of Republic Vehicles — Unauthorized use or theft. (10 minutes)",
    "3.14": "Possession of Illegal Firearm — Possessing Republic weaponry when raid weapons are active. (10 minutes)",
    "3.15": "Aiding Raiders or Criminals — Assisting known enemies of the Republic. (10 minutes)",
    "3.16": "Event Powergaming — Ignoring RP consequences or forcing unrealistic outcomes. (5–10 minutes)",

    // SECTION IV — INTERPERSONAL CONDUCT
    "4.1": "Doxxing — Sharing personal or identifying information. (10 minutes minimum)",
    "4.2": "Death Threats — Real-world threats or harm. (10 minutes)",
    "4.3": "Harassment — Repeated unwanted contact or behavior. (8–15 minutes)",
    "4.4": "Disrespect — Abusive or hostile conduct toward personnel. (5–10 minutes)",
    "4.5": "Impersonation / False Identity — Claiming false rank or role; must switch avatar immediately. (10–15 minutes)",
    "4.6": "Use of Forbidden Language — Slurs or hate speech (+5 minutes per repetition). (10–20 minutes)",
    "4.7": "Offensive or Inappropriate Profiles — Offensive avatars, names, or images; must adjust. (10 minutes)",
    "4.8": "NSFW Conduct On-Duty — Explicit content or avatars; must remove avatar before timer starts. (15 minutes)",
    "4.9": "Blasting Soundboards or Music — Excessive disruptive noise or media use. (10 minutes)",
    "4.10": "Inappropriate Conduct — Any vulgar or disrespectful public actions. (10–20 minutes)",
    "4.11": "Sexism / Discrimination — Any discriminatory language or behavior. (15 minutes)",
    "4.12": "Discussions or References to Extremist Groups — Any extremist or hate-based imagery. (15 minutes)",
    "4.13": "Avatars or Symbols Representing Extremist Groups — Immediate removal required. (15 minutes)",
    "4.14": "False Accusations — Submitting fabricated reports, falsified evidence, or malicious claims. (10 minutes)",
    "4.15": "Abuse of Disciplinary Systems — Weaponizing warnings, strikes, or reports against rivals or subordinates. (10–15 minutes)",
    "4.16": "Frivolous Appeals — Repeated appeals made solely to delay enforcement or avoid disciplinary outcome. (5–10 minutes)",

    // SECTION V — OFFENSES AGAINST REPUBLIC SECURITY
    "5.1": "Forgery — Altering or fabricating official data.",
    "5.2": "Treason — Actions or words betraying Republic loyalty. (15–20 minutes)",
    "5.3": "Sedition — Inciting rebellion or disobedience.",
    "5.4": "Espionage — Unauthorized surveillance or information leaks.",
    "5.5": "Dissemination of False Information — Spreading falsified reports.",
    "5.6": "Abuse of Authority — Exploiting rank for personal or unethical gain.",
    "5.7": "Withholding Information — Refusing to assist in investigation. (10 minutes)",
    "5.8": "Interference with Investigation — Disrupting or tampering with RI operations. (10–15 minutes)",
    "5.9": "Resisting Arrest or Killing While Under Arrest — Noncompliance or lethal force. (5 minutes)",
    "5.10": "Unauthorized Recording — Recording classified meetings without authorization. (15 minutes)",
    "5.11": "Intelligence Fabrication — Creating false threat alerts, falsified security concerns, or fabricated espionage claims. (15–20 minutes)",
    "5.12": "Evidence Tampering — Altering, deleting, or manipulating investigative materials or official records. (15–20 minutes)",
    "5.13": "Abuse of Permissions — Misuse of administrative, moderation, or server-level permissions. (15–20 minutes • Strike • Permission Removal • Tribunal Review)",

    // SECTION VI — ENLISTMENT AND INDOCTRINATION
    "6.1": "False Enlistment — Joining under false identity or deceit.",
    "6.2": "Breach of Indoctrination — Failing to uphold Republic training standards.",
    "6.3": "Unauthorized Recruitment — Attempting to enlist personnel without authority."
};

// ================= STORAGE =================
const warrants = new Map();       // Active warrants
const bounties = new Map();       // Active bounties
const offenderHistory = new Map();// Repeat offenders
let caseCounter = 1;

// ================= COMMAND HANDLER =================
client.on('messageCreate', async (msg) => {

    if (msg.author.bot) return;
    if (msg.channel.id !== COMMAND_CHANNEL) return;

    if (msg.content.toLowerCase().startsWith('!warrant-test')) {
        await createWarrant(msg, true);
    } else if (msg.content.toLowerCase().startsWith('!warrant')) {
        await createWarrant(msg, false);
    }
});

// ================= CREATE WARRANT =================
async function createWarrant(msg, isTest) {
    const prefix = isTest ? '!warrant-test' : '!warrant';
    const duration = isTest ? TEST_WARRANT_TIME : REAL_WARRANT_TIME;

    const args = msg.content.slice(prefix.length).trim().split('|');
    if (args.length < 2) return msg.reply(`Format: ${prefix} Suspect Name | LawCode1, LawCode2`);

    const suspect = args[0].trim();
    const rawCodes = args[1].trim();
    const codes = rawCodes.split(',').map(c => c.trim());
    const resolvedLaws = codes.map(code => lawBook[code] || `${code} — Unknown Law Code`).join('\n');

    const issuedBy = msg.member.displayName;

    // Offender tracking
    const previousCount = offenderHistory.get(suspect) || 0;
    const newCount = previousCount + 1;
    offenderHistory.set(suspect, newCount);

    const caseNumber = String(caseCounter++).padStart(4, '0');

    // Post warrant
    const warrantEmbed = new EmbedBuilder()
        .setTitle('📝 WARRANT ISSUED')
        .addFields(
            { name: 'Case Number', value: `#${caseNumber}` },
            { name: 'Suspect', value: suspect },
            { name: 'Law Codes', value: resolvedLaws },
            { name: 'Issued By', value: issuedBy }
        )
        .setColor('Red')
        .setTimestamp();

    const warrantChannel = await client.channels.fetch(WARRANT_CHANNEL);
    const warrantMsg = await warrantChannel.send({ embeds: [warrantEmbed] });
    await warrantMsg.react('✅');

    // Post warrant file/archive
    let caseMsg;
    try {
        const caseChannel = await client.channels.fetch(CASE_CHANNEL);
        const caseEmbed = new EmbedBuilder()
            .setTitle(`📁 WARRANT FILE #${caseNumber}`)
            .addFields(
                { name: 'Suspect', value: suspect },
                { name: 'Previous Warrants', value: `${previousCount}`, inline: true },
                { name: 'Current Total Warrants', value: `${newCount}`, inline: true },
                { name: 'Law Codes', value: resolvedLaws },
                { name: 'Issued By', value: issuedBy },
                { name: 'Status', value: 'ACTIVE WARRANT' }
            )
            .setColor('Blue')
            .setTimestamp();

        caseMsg = await caseChannel.send({ embeds: [caseEmbed] });
    } catch (err) {
        console.error("WARRANT FILE CHANNEL ERROR:", err);
    }

    warrants.set(warrantMsg.id, { suspect, resolvedLaws, issuedBy, caseMsg, caseNumber, message: warrantMsg });

    // Auto convert to bounty
    setTimeout(async () => {
        if (!warrants.has(warrantMsg.id)) return;
        await convertToBounty(warrantMsg.id);
    }, duration);
}

// ================= CONVERT TO BOUNTY =================
async function convertToBounty(warrantId) {
    const data = warrants.get(warrantId);
    if (!data) return;

    const { suspect, resolvedLaws, issuedBy, caseMsg, caseNumber, message } = data;

    const bountyEmbed = new EmbedBuilder()
        .setTitle('💰 BOUNTY ISSUED')
        .addFields(
            { name: 'Case Number', value: `#${caseNumber}` },
            { name: 'Suspect', value: suspect },
            { name: 'Law Codes', value: resolvedLaws },
            { name: 'Issued By', value: issuedBy },
            { name: 'Reward', value: '100 Credits' }
        )
        .setColor('Gold')
        .setTimestamp();

    const bountyChannel = await client.channels.fetch(BOUNTY_CHANNEL);
    const bountyMsg = await bountyChannel.send({ embeds: [bountyEmbed] });
    await bountyMsg.react('✅');

    bounties.set(bountyMsg.id, { caseMsg });

    // Update warrant file status
    if (caseMsg) {
        const updated = EmbedBuilder.from(caseMsg.embeds[0])
            .setColor('Gold')
            .spliceFields(5, 1, { name: 'Status', value: 'BOUNTY ISSUED' });
        await caseMsg.edit({ embeds: [updated] });
    }

    // Delete original warrant
    await message.delete().catch(() => {});
    warrants.delete(warrantId);
}

// ================= REACTION HANDLER =================
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.emoji.name !== '✅') return;

    // Handle bounty reactions
    if (bounties.has(reaction.message.id)) {
        const { caseMsg } = bounties.get(reaction.message.id);
        if (caseMsg) {
            const closed = EmbedBuilder.from(caseMsg.embeds[0])
                .setColor('Green')
                .spliceFields(5, 1, { name: 'Status', value: 'CLOSED' });
            await caseMsg.edit({ embeds: [closed] });
        }
        await reaction.message.delete().catch(() => {});
        bounties.delete(reaction.message.id);
    }

    // Handle warrant reactions
    else if (warrants.has(reaction.message.id)) {
        const { caseMsg } = warrants.get(reaction.message.id);
        if (caseMsg) {
            const closed = EmbedBuilder.from(caseMsg.embeds[0])
                .setColor('Green')
                .spliceFields(5, 1, { name: 'Status', value: 'CLOSED' });
            await caseMsg.edit({ embeds: [closed] });
        }
        await reaction.message.delete().catch(() => {});
        warrants.delete(reaction.message.id);
    }
});

client.login(process.env.TOKEN);