const submissionEmail = "vermontstrength@gmail.com";

const requesters = [
  { key: "Jim", hint: "Jim" },
  { key: "Linda", hint: "Linda" }
];

const priorities = [
  { key: "Low", hint: "Nice to have" },
  { key: "Normal", hint: "Next up" },
  { key: "High", hint: "Needs attention" }
];

const blankOrder = {
  id: "DRAFT",
  requester: "Jim",
  category: "Around the house",
  priority: "Normal",
  timeline: "This week",
  title: "Ready for the next Team Smith thing",
  details: "Write down what is going on and it will turn into a clear note Justin can pick up.",
  location: "Team Smith HQ",
  budget: "TBD",
  success: "Everyone knows what needs to happen next.",
  createdAt: "Not submitted yet"
};

const state = {
  requester: "Jim",
  priority: "Normal",
  currentOrder: blankOrder,
  saved: JSON.parse(localStorage.getItem("teamSmithWorkOrders") || "[]")
};

const form = document.querySelector("#workOrderForm");
const requesterInput = document.querySelector("#requester");
const priorityInput = document.querySelector("#priority");
const requesterButtons = document.querySelector("#requesterButtons");
const priorityButtons = document.querySelector("#priorityButtons");
const summaryGrid = document.querySelector("#summaryGrid");
const orderCard = document.querySelector("#orderCard");
const orderMeta = document.querySelector("#orderMeta");
const orderTitle = document.querySelector("#orderTitle");
const savedList = document.querySelector("#savedList");
const copyPanel = document.querySelector("#copyPanel");
const copyTextArea = document.querySelector("#copyTextArea");
const formStatus = document.querySelector("#formStatus");
const newButton = document.querySelector("#newButton");
const copyButton = document.querySelector("#copyButton");
const emailButton = document.querySelector("#emailButton");
const printButton = document.querySelector("#printButton");
const clearSavedButton = document.querySelector("#clearSavedButton");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formattedDate(date = new Date()) {
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function createOrderId(date = new Date()) {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TSH-${stamp}-${suffix}`;
}

function fieldValue(name, fallback = "") {
  const field = form.elements[name];
  return field ? field.value.trim() || fallback : fallback;
}

function createOrder() {
  const now = new Date();
  return {
    id: createOrderId(now),
    requester: state.requester,
    category: fieldValue("category", "Other"),
    priority: state.priority,
    timeline: fieldValue("timeline", "Flexible"),
    title: fieldValue("title", "Untitled family request"),
    details: fieldValue("details", "No details provided yet."),
    location: fieldValue("location", "Not specified"),
    budget: fieldValue("budget", "Not specified"),
    success: fieldValue("success", "Handled and confirmed."),
    createdAt: formattedDate(now)
  };
}

function plainTextOrder(order) {
  return `Team Smith HQ Help Request
${order.id}

Title: ${order.title}
From: ${order.requester}
Priority: ${order.priority}
Timeline: ${order.timeline}
Kind of thing: ${order.category}
Location: ${order.location}
Money note: ${order.budget}
Created: ${order.createdAt}

What is going on:
${order.details}

Done means:
${order.success}`;
}

function mailtoHref(order) {
  const subject = `[Team Smith HQ] ${order.priority} help: ${order.title}`;
  const params = new URLSearchParams({
    subject,
    body: plainTextOrder(order)
  });
  return `mailto:${submissionEmail}?${params.toString()}`;
}

function openNotificationDraft(order) {
  window.setTimeout(() => {
    window.location.href = mailtoHref(order);
  }, 150);
}

function renderRadioButtons(container, items, selected, dataName) {
  container.innerHTML = items
    .map((item) => `
      <button class="choice-button" type="button" role="radio" aria-checked="${selected === item.key}" data-${dataName}="${escapeHtml(item.key)}">
        <strong>${escapeHtml(item.key)}</strong>
        <span>${escapeHtml(item.hint)}</span>
      </button>
    `)
    .join("");
}

function renderControls() {
  requesterInput.value = state.requester;
  priorityInput.value = state.priority;
  renderRadioButtons(requesterButtons, requesters, state.requester, "requester");
  renderRadioButtons(priorityButtons, priorities, state.priority, "priority");
}

function renderOrder(order) {
  state.currentOrder = order;
  copyPanel.hidden = true;
  copyTextArea.value = "";
  orderMeta.textContent = `${order.id} / ${order.priority} priority / ${order.timeline}`;
  orderTitle.textContent = order.title;
  emailButton.href = mailtoHref(order);

  const summaryItems = [
    ["From", order.requester],
    ["Priority", order.priority],
    ["Timeline", order.timeline],
    ["Kind", order.category],
    ["Created", order.createdAt]
  ];

  summaryGrid.innerHTML = summaryItems
    .map(([label, value]) => `
      <div class="summary-item">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `)
    .join("");

  orderCard.innerHTML = `
    <article class="work-order">
      <div class="work-order-topline">
        <span>${escapeHtml(order.id)}</span>
        <span>${escapeHtml(order.category)}</span>
      </div>
      <div class="detail-section">
        <span class="block-kicker">What is going on</span>
        <p>${escapeHtml(order.details)}</p>
      </div>
      <div class="detail-grid">
        <div class="detail-section">
          <span class="block-kicker">Where</span>
          <p>${escapeHtml(order.location)}</p>
        </div>
        <div class="detail-section">
          <span class="block-kicker">Money note</span>
          <p>${escapeHtml(order.budget)}</p>
        </div>
      </div>
      <div class="detail-section success-section">
        <span class="block-kicker">Done means</span>
        <p>${escapeHtml(order.success)}</p>
      </div>
    </article>
  `;
}

function renderSaved() {
  if (!state.saved.length) {
    savedList.innerHTML = '<p class="empty-state">Requests you create will stay here on this device.</p>';
    return;
  }

  savedList.innerHTML = state.saved
    .map((order) => `
      <article class="saved-item">
        <button type="button" data-saved-id="${escapeHtml(order.id)}">
          <strong>${escapeHtml(order.title)}</strong>
          <span>${escapeHtml(order.requester)} / ${escapeHtml(order.priority)} / ${escapeHtml(order.timeline)}</span>
          <span>${escapeHtml(order.createdAt)}</span>
        </button>
      </article>
    `)
    .join("");
}

function persistSaved() {
  localStorage.setItem("teamSmithWorkOrders", JSON.stringify(state.saved.slice(0, 12)));
}

function saveOrder(order) {
  state.saved = [order, ...state.saved.filter((item) => item.id !== order.id)].slice(0, 12);
  persistSaved();
  renderSaved();
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    textarea.remove();
  }

  return copied;
}

function resetForm() {
  form.reset();
  state.requester = "Jim";
  state.priority = "Normal";
  renderControls();
  renderOrder(blankOrder);
  formStatus.textContent = "";
}

requesterButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-requester]");
  if (!button) return;
  state.requester = button.dataset.requester;
  renderControls();
});

priorityButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-priority]");
  if (!button) return;
  state.priority = button.dataset.priority;
  renderControls();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const order = createOrder();
  renderOrder(order);
  saveOrder(order);
  formStatus.textContent = `${order.id} saved. Opening an email draft for Justin.`;
  openNotificationDraft(order);
});

newButton.addEventListener("click", resetForm);

copyButton.addEventListener("click", async () => {
  if (!state.currentOrder) return;
  const text = plainTextOrder(state.currentOrder);

  try {
    const copied = await copyText(text);
    copyButton.textContent = copied ? "Copied" : "Select text";
    if (!copied) {
      copyTextArea.value = text;
      copyPanel.hidden = false;
      copyTextArea.focus();
      copyTextArea.select();
    }
  } catch {
    copyButton.textContent = "Select text";
    copyTextArea.value = text;
    copyPanel.hidden = false;
    copyTextArea.focus();
    copyTextArea.select();
  }

  window.setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1400);
});

printButton.addEventListener("click", () => {
  window.print();
});

savedList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-saved-id]");
  if (!button) return;
  const order = state.saved.find((item) => item.id === button.dataset.savedId);
  if (!order) return;
  state.requester = order.requester;
  state.priority = order.priority;
  renderControls();
  renderOrder(order);
  formStatus.textContent = `${order.id} loaded.`;
});

clearSavedButton.addEventListener("click", () => {
  state.saved = [];
  persistSaved();
  renderSaved();
});

renderControls();
renderOrder(blankOrder);
renderSaved();
