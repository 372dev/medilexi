import type { ReviewLang } from './review-langs'

/**
 * Per-language UI copy for the reviewer tool, so each reviewer sees their own
 * language. FR is the original French verbatim. KO is authored for the Korean
 * reviewer (the manager) and should be confirmed by them. ES/JA are not live in
 * Phase 1 (their route 404s), so they reuse the English copy as a placeholder
 * until Phase 2.
 *
 * No em dashes anywhere (CLAUDE.md 2). Flag keys are the language-neutral ones
 * from review-batches.flagsFor: num | long | sent | same.
 */
export type RvCopy = {
  eyebrow: string
  intro: string
  rulesSummary: string
  rules: string[]
  termsWord: string
  sourceLabel: string
  targetLabel: string
  fClinical: string
  fClinicalTgt: string
  fLay: string
  fLayTgt: string
  fDef: string
  fLayNone: string
  filters: { all: string; todo: string; flag: string; fix: string }
  searchPlaceholder: string
  correct: string
  toFix: string
  notePlaceholder: string
  noMatch: string
  submitTitle: string
  submitIntro: string
  submitBtn: string      // followed by " (n)"
  sending: string
  nothingToSend: string
  sentPrefix: string     // e.g. "Sent. " -> "Sent. 3 received. Thanks!"; keep it one string with {n}
  sentMid: string
  sentSuffix: string
  sendFailed: string
  levels: Record<number, string>
  flagHelp: Record<string, string>
}

const FLAG_HELP_EN: Record<string, string> = {
  num: 'The definition contains a number. Check it is not a country-variable threshold (reword) rather than an invariant fact (keep).',
  long: 'The definition is over the character limit.',
  sent: 'The definition looks like more than one sentence.',
  same: 'The target term is identical to the English. Often fine; just confirm it is not an untranslated entry.',
}

const EN: RvCopy = {
  eyebrow: 'MEDI LEXI · REVIEW',
  intro: 'The English source is on the left, our translation on the right. Correct the fields on the right, then mark each entry OK or to-fix. Your work is saved in this browser as you go, and submitting sends it to us directly.',
  rulesSummary: 'Our writing rules (read before you start)',
  rules: [
    'One sentence per definition, within the character limit.',
    'No country-variable numeric threshold. Invariant facts stay (46 chromosomes, first 28 days of life).',
    'Register: the clinical term is the head term, the everyday term is what a patient actually says. Never the reverse, and never a descriptive paraphrase: if there is no real everyday word, leave the field empty.',
    'A faithful translation of our English definition. Flag rather than invent if you are unsure.',
  ],
  termsWord: 'terms',
  sourceLabel: 'English · source',
  targetLabel: 'Translation · to review',
  fClinical: 'Clinical term',
  fClinicalTgt: 'Clinical term',
  fLay: 'Everyday term',
  fLayTgt: 'Everyday term (empty if none)',
  fDef: 'Definition',
  fLayNone: 'none',
  filters: { all: 'All', todo: 'To do', flag: 'Flagged', fix: 'To fix' },
  searchPlaceholder: 'Search a term…',
  correct: '✓ OK',
  toFix: '✎ To fix',
  notePlaceholder: 'Comment (optional)',
  noMatch: 'No entry matches.',
  submitTitle: 'Send your corrections',
  submitIntro: 'You can send more than once: send a first batch as soon as a series is done, rather than waiting for the end. Only the entries you edited or judged are transmitted.',
  submitBtn: 'Send',
  sending: 'Sending…',
  nothingToSend: 'Nothing to send yet.',
  sentPrefix: 'Sent. ',
  sentMid: ' entr(y/ies) received. Thanks!',
  sentSuffix: '',
  sendFailed: 'Sending failed. Copy the text below and email it to us.',
  levels: { 3: 'Essential', 2: 'Important', 1: 'Good to know' },
  flagHelp: FLAG_HELP_EN,
}

const FR: RvCopy = {
  eyebrow: 'MEDI LEXI · RÉVISION DU FRANÇAIS',
  intro: "L'anglais d'origine est à gauche, notre français à droite. Corrigez directement dans les champs de droite, puis indiquez si la fiche est correcte ou à modifier. Votre travail est enregistré dans ce navigateur au fur et à mesure, et l'envoi nous le transmet directement.",
  rulesSummary: 'Nos règles de rédaction (à lire avant de commencer)',
  rules: [
    "Français international. Nous visons la forme comprise dans toute la francophonie, pas le québécois en particulier. En cas de divergence réelle, choisissez la forme internationale et préférez le terme francisé à l'anglicisme.",
    'Une seule phrase par définition, 260 caractères maximum.',
    "Aucun seuil chiffré qui varie d'un pays à l'autre. Les faits invariables se gardent (46 chromosomes, 28 premiers jours de vie).",
    "Registre. Le terme clinique est le terme principal, le terme courant est celui qu'emploie réellement un patient. Jamais l'inverse, et jamais une paraphrase descriptive : s'il n'existe pas de vrai mot courant, laissez le champ vide.",
    "Traduction fidèle de notre définition anglaise. Signalez plutôt que d'inventer si vous n'êtes pas sûr.",
  ],
  termsWord: 'termes',
  sourceLabel: 'Anglais · source',
  targetLabel: 'Français · à réviser',
  fClinical: 'Terme clinique',
  fClinicalTgt: 'Terme clinique',
  fLay: 'Terme courant',
  fLayTgt: 'Terme courant (vide si aucun)',
  fDef: 'Définition',
  fLayNone: 'aucun',
  filters: { all: 'Toutes', todo: 'À faire', flag: 'Signalées', fix: 'À corriger' },
  searchPlaceholder: 'Rechercher un terme…',
  correct: '✓ Correct',
  toFix: '✎ À corriger',
  notePlaceholder: 'Commentaire (facultatif)',
  noMatch: 'Aucune fiche ne correspond.',
  submitTitle: 'Envoyer vos corrections',
  submitIntro: "Vous pouvez envoyer plusieurs fois : envoyez un premier lot dès qu'une série de fiches est terminée, plutôt que d'attendre la fin. Seules les fiches que vous avez modifiées ou jugées sont transmises.",
  submitBtn: 'Envoyer',
  sending: 'Envoi…',
  nothingToSend: "Aucune correction à envoyer pour l'instant.",
  sentPrefix: 'Envoyé. ',
  sentMid: ' fiche(s) reçue(s). Merci !',
  sentSuffix: '',
  sendFailed: "L'envoi a échoué. Copiez le texte ci-dessous et envoyez-le par courriel.",
  levels: { 3: 'Essentiel', 2: 'Important', 1: 'Utile' },
  flagHelp: {
    num: "La définition contient un nombre. Vérifiez que ce n'est pas un seuil qui varie selon les pays (à reformuler) plutôt qu'un fait invariable (à garder).",
    long: 'La définition dépasse 260 caractères.',
    sent: "La définition semble contenir plus d'une phrase.",
    same: "Le terme français est identique à l'anglais. C'est souvent correct (Palpitation, Migraine) ; vérifiez seulement qu'il ne s'agit pas d'un oubli de traduction.",
  },
}

// KO copy authored for the manager (the KO reviewer) to confirm.
const KO: RvCopy = {
  eyebrow: 'MEDI LEXI · 한국어 검수',
  intro: '왼쪽은 영어 원문, 오른쪽은 우리 한국어 번역입니다. 오른쪽 칸에서 직접 수정한 뒤, 각 항목을 정상 또는 수정 필요로 표시하세요. 작업 내용은 이 브라우저에 자동 저장되며, 제출하면 저희에게 바로 전달됩니다.',
  rulesSummary: '작성 규칙 (시작 전에 읽어주세요)',
  rules: [
    '표준 의학 한국어 용어를 사용합니다 (차트와 ICD에서 쓰는 용어).',
    '정의는 한 문장, 160자 이내로 작성합니다.',
    '국가별로 달라지는 수치 기준은 넣지 않습니다. 변하지 않는 사실은 유지합니다 (염색체 46개, 생후 28일).',
    '등록 구분: 임상 용어가 대표어이고, 일상어는 환자가 실제로 쓰는 말입니다. 절대 반대로 쓰지 않으며, 설명식 풀이도 쓰지 않습니다. 진짜 일상어가 없으면 칸을 비워 두세요.',
    '영어 정의를 충실히 번역합니다. 확신이 없으면 임의로 만들지 말고 표시해 주세요.',
  ],
  termsWord: '개 용어',
  sourceLabel: '영어 · 원문',
  targetLabel: '한국어 · 검수',
  fClinical: '임상 용어',
  fClinicalTgt: '임상 용어',
  fLay: '일상어',
  fLayTgt: '일상어 (없으면 비움)',
  fDef: '정의',
  fLayNone: '없음',
  filters: { all: '전체', todo: '할 일', flag: '표시됨', fix: '수정 필요' },
  searchPlaceholder: '용어 검색…',
  correct: '✓ 정상',
  toFix: '✎ 수정 필요',
  notePlaceholder: '의견 (선택)',
  noMatch: '해당하는 항목이 없습니다.',
  submitTitle: '수정 사항 보내기',
  submitIntro: '여러 번 나누어 보낼 수 있습니다. 끝까지 기다리지 말고 한 묶음이 끝나면 먼저 보내주세요. 수정했거나 표시한 항목만 전송됩니다.',
  submitBtn: '보내기',
  sending: '전송 중…',
  nothingToSend: '보낼 수정 사항이 없습니다.',
  sentPrefix: '전송됨. ',
  sentMid: '개 항목이 접수되었습니다. 감사합니다!',
  sentSuffix: '',
  sendFailed: '전송에 실패했습니다. 아래 내용을 복사하여 이메일로 보내주세요.',
  levels: { 3: '필수', 2: '중요', 1: '알아두면 좋음' },
  flagHelp: {
    num: '정의에 숫자가 있습니다. 나라마다 다른 기준값(수정 필요)인지, 변하지 않는 사실(유지)인지 확인하세요.',
    long: '정의가 160자를 넘습니다.',
    sent: '정의가 한 문장보다 길어 보입니다.',
    same: '한국어 용어가 영어와 동일합니다. 대개 정상이지만, 번역 누락은 아닌지 확인하세요.',
  },
}

export const RV_COPY: Record<ReviewLang, RvCopy> = { fr: FR, ko: KO, es: EN, ja: EN }
