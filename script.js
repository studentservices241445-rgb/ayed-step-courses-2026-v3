// Shared JavaScript for Ayed Academy STEP courses site

// ====== Mobile menu toggle ======
const menuButton = document.getElementById('menuBtn');
const mobileMenuEl = document.getElementById('mobileMenu');
if (menuButton && mobileMenuEl) {
  menuButton.addEventListener('click', () => {
    mobileMenuEl.classList.toggle('hidden');
  });
  mobileMenuEl.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => mobileMenuEl.classList.add('hidden'));
  });
}

// ====== Countdown timer ======
// Calculates time left until a fixed deadline (29 January 2026 at 23:59:59)
const deadlineTs = new Date(2026, 0, 29, 23, 59, 59).getTime();
function pad(num) {
  return String(num).padStart(2, '0');
}
function updateCountdown() {
  const now = Date.now();
  let diff = Math.max(0, deadlineTs - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor(diff / 1000);
  const dEl = document.getElementById('cdDays');
  const hEl = document.getElementById('cdHours');
  const mEl = document.getElementById('cdMins');
  const sEl = document.getElementById('cdSecs');
  if (dEl) dEl.textContent = days;
  if (hEl) hEl.textContent = pad(hours);
  if (mEl) mEl.textContent = pad(minutes);
  if (sEl) sEl.textContent = pad(seconds);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ====== Toast notifications ======
function showToast(message, subtitle = '') {
  const toastContainer = document.getElementById('toast');
  if (!toastContainer) return;
  const card = document.createElement('div');
  card.className = 'toast-card';
  card.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="pulse-dot mt-1"></div>
      <div class="min-w-0">
        <div class="font-extrabold text-sm">${message}</div>
        ${subtitle ? `<div class="text-xs text-white/70 mt-1">${subtitle}</div>` : ''}
      </div>
      <button class="ms-auto text-white/60 hover:text-white" aria-label="close">✕</button>
    </div>
  `;
  toastContainer.appendChild(card);
  requestAnimationFrame(() => card.classList.add('show'));
  const closeBtn = card.querySelector('button');
  const remove = () => {
    card.classList.remove('show');
    setTimeout(() => card.remove(), 250);
  };
  closeBtn.addEventListener('click', remove);
  setTimeout(remove, 4500);
}

// ====== Copy button functionality ======
document.querySelectorAll('.copyBtn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const val = btn.getAttribute('data-copy') || '';
    try {
      await navigator.clipboard.writeText(val);
      showToast('تم النسخ ✅', 'تم نسخ البيانات بنجاح');
    } catch (e) {
      const textarea = document.createElement('textarea');
      textarea.value = val;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      showToast('تم النسخ ✅');
    }
  });
});

// ====== Form submission logic ======
// Looks for a form with ID 'enrollForm' and prepares a Telegram message using
// global variables COURSE_NAME, COURSE_PRICE, ACCESS_DAYS. Each page can override these.
const enrollForm = document.getElementById('enrollForm');
const resultBox = document.getElementById('resultBox');
const readyMsg = document.getElementById('readyMsg');
const copyMsgBtn = document.getElementById('copyMsgBtn');
const openTgBtn = document.getElementById('openTgBtn');

if (enrollForm) {
  enrollForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Gather inputs
    const fullName = document.getElementById('fullName').value.trim();
    const contactMethod = document.getElementById('contactMethod').value;
    const contactValue = document.getElementById('contactValue').value.trim();
    const examDate = document.getElementById('examDate').value.trim();
    const targetScore = document.getElementById('targetScore')?.value.trim() || '';
    const prev = document.getElementById('prevAttempt')?.value || '';
    const prevScore = document.getElementById('prevScore')?.value.trim() || '';
    const reason = document.getElementById('reason')?.value.trim() || '';
    const notes = document.getElementById('notes')?.value.trim() || '';
    const receipt = document.getElementById('receipt')?.files?.[0];
    const agree = document.getElementById('agreeTerms');
    if (!receipt) {
      showToast('أرفق الإيصال أولاً ❗');
      document.getElementById('receipt').focus();
      return;
    }
    // Ensure terms are accepted if the checkbox is present
    if (agree && !agree.checked) {
      showToast('الرجاء الموافقة على الشروط والأحكام قبل المتابعة ❗');
      return;
    }
    // Determine labels
    const methodLabel = contactMethod === 'telegram' ? 'تيليجرام' : (contactMethod === 'whatsapp' ? 'واتساب' : 'إيميل');
    // Compose message
    const lines = [];
    lines.push('السلام عليكم ورحمة الله وبركاته');
    lines.push('يعطيكم العافية 🌿');
    lines.push(`أبغى تأكيد اشتراكي في: ${window.COURSE_NAME || 'الدورة'}`);
    lines.push('—');
    lines.push(`الاسم: ${fullName}`);
    lines.push(`وسيلة التواصل: ${methodLabel} — ${contactValue || '(ما كتب)'}`);
    lines.push(`موعد الاختبار: ${examDate}`);
    if (targetScore) lines.push(`الدرجة المستهدفة: ${targetScore}`);
    if (prev) lines.push(`هل اختبرت سابقاً؟ ${prev === 'yes' ? 'نعم' : 'لا'}`);
    if (prev === 'yes' && prevScore) lines.push(`الدرجة السابقة: ${prevScore}`);
    lines.push(`سبب التسجيل: ${reason}`);
    if (notes) lines.push(`ملاحظات: ${notes}`);
    lines.push('—');
    lines.push('تم رفع الإيصال عبر الموقع ✅');
    lines.push('وبإذن الله أرفقه لكم هنا بالخاص مرة ثانية للتفعيل (صورة/‏PDF).');
    lines.push('—');
    lines.push(`رسوم الاشتراك: ${window.COURSE_PRICE || '---'} ريال`);
    lines.push(`مدة الوصول: ${window.ACCESS_DAYS || '---'}`);
    lines.push('شكراً لكم 🙏');
    const message = lines.join('\n');
    if (readyMsg) readyMsg.value = message;
    if (resultBox) resultBox.classList.remove('hidden');
    const tgUrl = `https://t.me/${window.OFFICIAL_USERNAME || 'Ayed_Academy_2026'}?text=${encodeURIComponent(message)}`;
    if (openTgBtn) openTgBtn.href = tgUrl;
    if (resultBox) resultBox.scrollIntoView({behavior:'smooth', block:'start'});
    showToast('تم تجهيز الرسالة ✅', 'الآن افتح تيليجرام وارسلها');
  });
}

// Copy prepared message
if (copyMsgBtn) {
  copyMsgBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(readyMsg.value);
      showToast('تم نسخ الرسالة ✅');
    } catch (e) {
      readyMsg.select();
      document.execCommand('copy');
      showToast('تم نسخ الرسالة ✅');
    }
  });
}

// ====== Referral program form ======
// Handles creation of a shareable referral message and collects payout preferences.
const referralForm = document.getElementById('referralForm');
const referralResult = document.getElementById('referralResult');
const referralMsgBox = document.getElementById('referralMsg');
const copyReferralBtn = document.getElementById('copyReferralBtn');
if (referralForm) {
  referralForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Read form values
    const name = document.getElementById('refName').value.trim();
    const source = document.getElementById('refSource').value;
    const sourceDetail = document.getElementById('refSourceDetail').value.trim();
    const payoutMethod = document.getElementById('payoutMethod').value;
    const tgUser = document.getElementById('payoutTgUser')?.value.trim() || '';
    const bankName = document.getElementById('payoutBankName')?.value.trim() || '';
    const iban = document.getElementById('payoutIban')?.value.trim() || '';
    const agreeRef = document.getElementById('agreeReferral');
    if (agreeRef && !agreeRef.checked) {
      showToast('يجب قبول شروط برنامج الإحالة ❗');
      return;
    }
    // Build message
    let msgLines = [];
    msgLines.push(`مرحباً! ${name ? 'أنا ' + name + '، ' : ''}أشارككم فرصة رائعة لرفع درجتكم في اختبار STEP.`);
    msgLines.push('دورات STEP المكثفة والشاملة من أكاديمية عايد تقدم شرحًا متقنًا، خطط مذاكرة مرنة، نماذج محاكية، وتحديثات مستمرة.');
    msgLines.push('انضم الآن واحصل على استشارة مجانية من المدرب، وتأكد من تحقيق نتيجتك المستهدفة بإذن الله.');
    msgLines.push('للتسجيل والاستفادة من الخصم الحالي، استخدم هذا الرابط:');
    msgLines.push(window.location.origin + '/ayed-step-courses-2026-v2/');
    msgLines.push('');
    msgLines.push('كل تسجيل عبر رابطك يضيف لك مكافأة 2 دولار (حوالي 7.5 ريال) تُضاف إلى رصيدك.');
    msgLines.push('');
    msgLines.push('شكراً لثقتكم، وبالتوفيق للجميع!');
    const resultMsg = msgLines.join('\n');
    if (referralMsgBox) referralMsgBox.value = resultMsg;
    if (referralResult) referralResult.classList.remove('hidden');
    showToast('تم تجهيز رسالة الإحالة ✅', 'يمكنك نسخها ومشاركتها الآن');
  });
}

// Copy referral message
if (copyReferralBtn) {
  copyReferralBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(referralMsgBox.value);
      showToast('تم نسخ رسالة الإحالة ✅');
    } catch (e) {
      referralMsgBox.select();
      document.execCommand('copy');
      showToast('تم نسخ رسالة الإحالة ✅');
    }
  });
}

// Demo notifications (optional). Uncomment to enable.
// const demoEvents = [
//   {name:'نوف', text:'سجّلت في الدورة المكثفة', ago:'قبل دقيقة'},
//   {name:'سلمان', text:'اشترى الدورة الشاملة', ago:'قبل 3 دقائق'},
//   {name:'رهف', text:'رفعت الإيصال للتأكيد', ago:'قبل 5 دقائق'},
//   {name:'محمد', text:'يسأل عن الفرق بين الدورتين', ago:'قبل 7 دقائق'},
//   {name:'سارة', text:'أنهت خطة الـ30 يوم بنجاح', ago:'قبل 10 دقائق'},
// ];
// function showDemoActivity() {
//   const item = demoEvents[Math.floor(Math.random() * demoEvents.length)];
//   showToast('نشاط جديد (تمثيلي)', `${item.name} — ${item.text} — ${item.ago}`);
// }
// setTimeout(showDemoActivity, 8000);
// setInterval(showDemoActivity, 45000);