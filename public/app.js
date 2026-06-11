const runtimeStatus = document.querySelector("#runtimeStatus");
const form = document.querySelector("#walletForm");
const userIdInput = document.querySelector("#userId");
const balanceInput = document.querySelector("#balance");
const submitButton = document.querySelector("#submitButton");
const result = document.querySelector("#result");
const walletClearForm = document.querySelector("#walletClearForm");
const clearWalletUserIdInput = document.querySelector("#clearWalletUserId");
const clearWalletButton = document.querySelector("#clearWalletButton");
const directoryItems = Array.from(document.querySelectorAll(".directory-item"));
const toolPanels = Array.from(document.querySelectorAll(".tool-panel"));
const subtabButtons = Array.from(document.querySelectorAll(".subtab-button"));
const subtabPanels = Array.from(document.querySelectorAll(".subtab-panel"));
const sayhiQueryForm = document.querySelector("#sayhiQueryForm");
const sayhiQueryUserIdInput = document.querySelector("#sayhiQueryUserId");
const querySayhiButton = document.querySelector("#querySayhiButton");
const sayhiQueryResult = document.querySelector("#sayhiQueryResult");
const deleteSayhiForm = document.querySelector("#deleteSayhiForm");
const deleteSayhiUserIdInput = document.querySelector("#deleteSayhiUserId");
const deleteSayhiButton = document.querySelector("#deleteSayhiButton");
const deleteSayhiResult = document.querySelector("#deleteSayhiResult");
const memberSubscriptionForm = document.querySelector("#memberSubscriptionForm");
const memberUserIdInput = document.querySelector("#memberUserId");
const memberDurationInput = document.querySelector("#memberDuration");
const memberSubscriptionButton = document.querySelector("#memberSubscriptionButton");
const memberSubscriptionResult = document.querySelector("#memberSubscriptionResult");
const sayhiCountForm = document.querySelector("#sayhiCountForm");
const sayhiCountUserIdInput = document.querySelector("#sayhiCountUserId");
const sayhiCountInput = document.querySelector("#sayhiCount");
const sayhiCountButton = document.querySelector("#sayhiCountButton");
const sayhiCountResult = document.querySelector("#sayhiCountResult");
const iosPackageForm = document.querySelector("#iosPackageForm");
const iosPackageAppNameInput = document.querySelector("#iosPackageAppName");
const iosPackageButton = document.querySelector("#iosPackageButton");
const iosPackageResult = document.querySelector("#iosPackageResult");
const videoInviteCardForm = document.querySelector("#videoInviteCardForm");
const inviteCardUserIdInput = document.querySelector("#inviteCardUserId");
const inviteCardStreamerIdInput = document.querySelector("#inviteCardStreamerId");
const inviteCardStreamerTokenInput = document.querySelector("#inviteCardStreamerToken");
const videoInviteCardButton = document.querySelector("#videoInviteCardButton");
const videoInviteCardResult = document.querySelector("#videoInviteCardResult");
const freeOneMinuteCallForm = document.querySelector("#freeOneMinuteCallForm");
const freeOneMinuteUserIdInput = document.querySelector("#freeOneMinuteUserId");
const freeOneMinuteButton = document.querySelector("#freeOneMinuteButton");
const freeOneMinuteResult = document.querySelector("#freeOneMinuteResult");
const streamerPpvAuditForm = document.querySelector("#streamerPpvAuditForm");
const streamerPpvUserIdInput = document.querySelector("#streamerPpvUserId");
const streamerPpvStatusSelect = document.querySelector("#streamerPpvStatus");
const streamerPpvCountInput = document.querySelector("#streamerPpvCount");
const streamerPpvAuditButton = document.querySelector("#streamerPpvAuditButton");
const streamerPpvAuditResult = document.querySelector("#streamerPpvAuditResult");
const auditStatusForm = document.querySelector("#auditStatusForm");
const auditAppNameInput = document.querySelector("#auditAppName");
const auditedAtSelect = document.querySelector("#auditedAt");
const auditStatusButton = document.querySelector("#auditStatusButton");
const auditStatusResult = document.querySelector("#auditStatusResult");
const anchorPasswordForm = document.querySelector("#anchorPasswordForm");
const anchorPasswordUserIdInput = document.querySelector("#anchorPasswordUserId");
const anchorPasswordButton = document.querySelector("#anchorPasswordButton");
const anchorPasswordResult = document.querySelector("#anchorPasswordResult");

let runtimeConfig = null;

function activateTab(tabId) {
  const nextTabId = toolPanels.some((panel) => panel.dataset.panel === tabId) ? tabId : "walletOperation";

  for (const item of directoryItems) {
    const isActive = item.dataset.tab === nextTabId;
    item.classList.toggle("active", isActive);

    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  }

  for (const panel of toolPanels) {
    panel.classList.toggle("active", panel.dataset.panel === nextTabId);
  }
}

function activateRoute(hash) {
  const route = hash.replace("#", "");
  const sayhiSubtabId = route.startsWith("sayhiData-") ? route.replace("sayhiData-", "") : "";
  const walletSubtabId = route.startsWith("walletOperation-") ? route.replace("walletOperation-", "") : "";

  if (walletSubtabId) {
    activateTab("walletOperation");
    activateSubtab(walletSubtabId);
    return;
  }

  if (sayhiSubtabId) {
    activateTab("sayhiData");
    activateSubtab(sayhiSubtabId);
    return;
  }

  activateTab(route);

  if (!route || route === "walletOperation") {
    activateSubtab("addWalletCoins");
    return;
  }

  if (route === "sayhiData") {
    activateSubtab("querySayhi");
  }
}

function setStatus(text, state) {
  runtimeStatus.textContent = text;
  runtimeStatus.className = `status ${state}`;
}

function activateSubtab(subtabId) {
  const nextSubtabId = subtabPanels.some((panel) => panel.dataset.subtabPanel === subtabId)
    ? subtabId
    : "querySayhi";

  for (const button of subtabButtons) {
    const isActive = button.dataset.subtab === nextSubtabId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  }

  for (const panel of subtabPanels) {
    panel.classList.toggle("active", panel.dataset.subtabPanel === nextSubtabId);
  }
}

function renderError(message) {
  result.className = "empty-state message-error";
  result.textContent = message;
}

function renderActionError(container, message) {
  container.className = "empty-state query-result message-error";
  container.textContent = message;
}

function renderActionMessage(container, message, className = "message-info") {
  container.className = `empty-state query-result ${className}`;
  container.textContent = message;
}

function createResultCell(label, value) {
  const cell = document.createElement("div");
  const labelElement = document.createElement("div");
  const valueElement = document.createElement("div");

  labelElement.className = "result-label";
  valueElement.className = "result-value";
  labelElement.textContent = label;
  valueElement.textContent = value ?? "未找到";
  cell.append(labelElement, valueElement);

  return cell;
}

function formatTableValue(value) {
  if (value === null || value === undefined || value === "") {
    return "未找到";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function createTableCell(tagName, text, className = "") {
  const cell = document.createElement(tagName);

  cell.textContent = formatTableValue(text);

  if (className) {
    cell.className = className;
  }

  return cell;
}

function createHorizontalTable(headers, rows, className = "") {
  const wrapper = document.createElement("div");
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");

  wrapper.className = "data-table-wrap";
  table.className = `data-table ${className}`.trim();

  for (const header of headers) {
    headerRow.append(createTableCell("th", header));
  }

  for (const row of rows) {
    const bodyRow = document.createElement("tr");

    for (const value of row) {
      bodyRow.append(createTableCell("td", value));
    }

    tbody.append(bodyRow);
  }

  thead.append(headerRow);
  table.append(thead, tbody);
  wrapper.append(table);

  return wrapper;
}

function getSayhiRecordFields(records) {
  const preferredFields = ["_id", "from_uuid", "to_uuid", "updated_at", "created_at"];
  const fields = [];

  for (const field of preferredFields) {
    if (records.some((record) => Object.prototype.hasOwnProperty.call(record ?? {}, field))) {
      fields.push(field);
    }
  }

  for (const record of records) {
    for (const field of Object.keys(record ?? {})) {
      if (!fields.includes(field)) {
        fields.push(field);
      }
    }
  }

  return fields;
}

function createSayhiRecordsTable(records) {
  const fields = getSayhiRecordFields(records);
  const headers = ["序号", ...fields];
  const rows = records.map((record, index) => [
    index + 1,
    ...fields.map((field) => record?.[field])
  ]);

  return createHorizontalTable(headers, rows, "sayhi-record-table");
}

function appendFailureReason(row, reason) {
  if (!reason) {
    return;
  }

  row.append(createResultCell("失败原因", reason));
}

function renderWalletActionSuccess(container, payload) {
  const summary = document.createElement("div");

  container.className = "result-grid";
  summary.className = "result-summary";

  const uidText = document.createElement("span");
  const balanceText = document.createElement("span");
  uidText.textContent = `UID ${payload.userId}`;
  balanceText.textContent = `余额 ${payload.targetBalance}`;
  summary.append(uidText, balanceText);

  const rows = payload.results.map((row) => {
    const resultRow = document.createElement("div");
    const targetCell = document.createElement("div");
    const targetValue = document.createElement("div");
    const targetLabel = document.createElement("div");

    resultRow.className = "result-row";
    targetValue.className = "result-value";
    targetLabel.className = "result-label";
    targetValue.textContent = row.target;
    targetLabel.textContent = row.name;
    targetCell.append(targetValue, targetLabel);
    resultRow.append(
      targetCell,
      createResultCell("更新前", row.beforeBalance),
      createResultCell("更新后", row.afterBalance),
      createResultCell("匹配行", row.affectedRows),
      createResultCell("变更行", row.changedRows)
    );

    return resultRow;
  });

  container.replaceChildren(summary, ...rows);
}

function renderSayhiCountSuccess(payload) {
  const summary = document.createElement("div");
  const uidText = document.createElement("span");
  const countText = document.createElement("span");
  const table = createHorizontalTable(
    ["操作项", "数据源", "更新前", "更新后", "匹配行", "变更行"],
    [[
      payload.result.target,
      payload.result.name,
      payload.result.beforeCount,
      payload.result.afterCount,
      payload.result.affectedRows,
      payload.result.changedRows
    ]],
    "sayhi-count-table"
  );

  sayhiCountResult.className = "result-grid";
  summary.className = "result-summary";

  uidText.textContent = `UID ${payload.userId}`;
  countText.textContent = `Count ${payload.targetCount}`;
  summary.append(uidText, countText);

  sayhiCountResult.replaceChildren(summary, table);
}

function renderMemberSubscriptionResult(status, duration, reason = "") {
  const row = document.createElement("div");

  memberSubscriptionResult.className = "result-grid";
  row.className = "result-row member-result-row";

  row.append(
    createResultCell("开通状态", status),
    createResultCell("开通时长", `${duration} 秒`)
  );
  appendFailureReason(row, reason);

  memberSubscriptionResult.replaceChildren(row);
}

function renderMemberSubscriptionSuccess(payload) {
  renderMemberSubscriptionResult("成功", payload.duration);
}

function renderMemberSubscriptionError(duration, reason) {
  renderMemberSubscriptionResult("失败", duration || "未提交", reason);
}

function canRunMemberSubscription() {
  return Boolean(runtimeConfig?.configured && runtimeConfig.memberEvent?.configured);
}

function canRunVideoInviteCard() {
  return Boolean(runtimeConfig?.configured && runtimeConfig.inviteCard?.configured);
}

function renderVideoInviteCardResult(status, userId, streamerId, reason = "") {
  const row = document.createElement("div");

  videoInviteCardResult.className = "result-grid";
  row.className = "result-row video-invite-result-row";
  row.append(
    createResultCell("下发状态", status),
    createResultCell("用户UID", userId || "未提交"),
    createResultCell("主播UID", streamerId || "未提交")
  );
  appendFailureReason(row, reason);

  videoInviteCardResult.replaceChildren(row);
}

function renderFreeOneMinuteResult(status, userId, reason = "") {
  const row = document.createElement("div");

  freeOneMinuteResult.className = "result-grid";
  row.className = "result-row member-result-row";
  row.append(
    createResultCell("执行状态", status),
    createResultCell("userid", userId || "未提交")
  );
  appendFailureReason(row, reason);

  freeOneMinuteResult.replaceChildren(row);
}

function renderStreamerPpvAuditResult(status, userId, successCount, failureCount, reason = "") {
  const row = document.createElement("div");

  streamerPpvAuditResult.className = "result-grid";
  row.className = "result-row streamer-pp-result-row";
  row.append(
    createResultCell("执行状态", status),
    createResultCell("主播UID", userId || "未提交"),
    createResultCell("成功数量", successCount),
    createResultCell("失败数量", failureCount)
  );
  appendFailureReason(row, reason);

  streamerPpvAuditResult.replaceChildren(row);
}

function renderSayhiQueryError(message) {
  sayhiQueryResult.className = "empty-state query-result message-error";
  sayhiQueryResult.textContent = message;
}

function renderSayhiQueryMessage(message, className = "message-info") {
  sayhiQueryResult.className = `empty-state query-result ${className}`;
  sayhiQueryResult.textContent = message;
}

function renderSayhiQuerySuccess(payload) {
  const summary = document.createElement("div");
  const uidText = document.createElement("span");
  const uuidText = document.createElement("span");
  const countText = document.createElement("span");
  const records = Array.isArray(payload.records) ? payload.records : [];
  const recordList = document.createElement("div");

  sayhiQueryResult.className = "query-result result-grid";
  summary.className = "result-summary";
  recordList.className = "record-list";
  uidText.textContent = `UID ${payload.userId}`;
  uuidText.textContent = `UUID ${payload.uuid}`;
  countText.textContent = `${payload.count} 条`;

  summary.append(uidText, uuidText, countText);

  if (records.length === 0) {
    const empty = document.createElement("div");

    empty.className = "empty-state";
    empty.textContent = "暂无数据";
    recordList.append(empty);
  } else {
    recordList.append(createSayhiRecordsTable(records));
  }

  sayhiQueryResult.replaceChildren(summary, recordList);
}

function renderDeleteSayhiResult(status, userId, deletedCount, reason = "") {
  const row = document.createElement("div");

  deleteSayhiResult.className = "result-grid";
  row.className = "result-row video-invite-result-row";
  row.append(
    createResultCell("删除状态", status),
    createResultCell("user_id", userId || "未提交"),
    createResultCell("删除数量", deletedCount)
  );
  appendFailureReason(row, reason);

  deleteSayhiResult.replaceChildren(row);
}

function appendInfoItem(container, label, value) {
  const item = document.createElement("div");
  const labelElement = document.createElement("div");
  const valueElement = document.createElement("div");

  item.className = "target-item";
  labelElement.className = "result-label";
  valueElement.className = "result-value";
  labelElement.textContent = label;
  valueElement.textContent = value ?? "未识别";
  item.append(labelElement, valueElement);
  container.append(item);
}

function renderIosPackageSuccess(payload) {
  const summary = document.createElement("div");
  const appNameText = document.createElement("span");
  const statusText = document.createElement("span");
  const details = document.createElement("div");
  const listedText = payload.isListed === true ? "是" : payload.isListed === false ? "否" : "未识别";

  iosPackageResult.className = "query-result result-grid";
  summary.className = "result-summary";
  details.className = "target-list";
  appNameText.textContent = `app_name ${payload.appName}`;
  statusText.textContent = payload.statusText;
  summary.append(appNameText, statusText);

  appendInfoItem(details, "是否在架", listedText);
  appendInfoItem(details, "查询状态", `HTTP ${payload.httpStatus}`);
  appendInfoItem(details, "查询时间", new Date(payload.checkedAt).toLocaleString());

  iosPackageResult.replaceChildren(summary, details);
}

function renderAuditStatusSuccess(payload) {
  const summary = document.createElement("div");
  const appNameText = document.createElement("span");
  const modeText = document.createElement("span");
  const row = document.createElement("div");
  const targetCell = document.createElement("div");
  const targetValue = document.createElement("div");
  const targetLabel = document.createElement("div");

  auditStatusResult.className = "result-grid";
  summary.className = "result-summary";
  row.className = "result-row";
  targetValue.className = "result-value";
  targetLabel.className = "result-label";
  appNameText.textContent = `appname ${payload.appName}`;
  modeText.textContent = payload.modeName;
  summary.append(appNameText, modeText);

  targetValue.textContent = "防审核状态";
  targetLabel.textContent = "操作项";
  targetCell.append(targetValue, targetLabel);
  row.append(
    targetCell,
    createResultCell("更新前", payload.result.beforeAuditedAt),
    createResultCell("更新后", payload.result.afterAuditedAt),
    createResultCell("匹配行", payload.result.affectedRows),
    createResultCell("变更行", payload.result.changedRows)
  );

  auditStatusResult.replaceChildren(summary, row);
}

function renderAnchorPasswordResult(status, userId, number = "未找到", password = "未返回", reason = "") {
  const row = document.createElement("div");

  anchorPasswordResult.className = "result-grid";
  row.className = "result-row streamer-pp-result-row";
  row.append(
    createResultCell("设置状态", status),
    createResultCell("主播UID", userId || "未提交"),
    createResultCell("number", number),
    createResultCell("密码", password)
  );
  appendFailureReason(row, reason);

  anchorPasswordResult.replaceChildren(row);
}

function renderSuccess(payload) {
  renderWalletActionSuccess(result, payload);
}

async function loadRuntimeConfig() {
  const response = await fetch("/api/config");
  runtimeConfig = await response.json();

  balanceInput.value = "";

  if (!runtimeConfig.sayhiQuery?.mongoConfigured) {
    querySayhiButton.disabled = true;
    deleteSayhiButton.disabled = true;
    renderSayhiQueryMessage(`缺少 ${runtimeConfig.sayhiQuery?.missingMongoKeys.join(", ")}，无法执行查询`, "message-warn");
    renderActionMessage(deleteSayhiResult, `缺少 ${runtimeConfig.sayhiQuery?.missingMongoKeys.join(", ")}，无法删除sayhi数据`, "message-warn");
  } else {
    querySayhiButton.disabled = false;
    deleteSayhiButton.disabled = false;
  }

  if (runtimeConfig.configured) {
    setStatus(`${runtimeConfig.dbHost}:${runtimeConfig.dbPort}`, "ready");
    submitButton.disabled = false;
    clearWalletButton.disabled = false;
    sayhiCountButton.disabled = false;
    auditStatusButton.disabled = false;
    freeOneMinuteButton.disabled = false;
    streamerPpvAuditButton.disabled = false;
    anchorPasswordButton.disabled = false;
    memberSubscriptionButton.disabled = !runtimeConfig.memberEvent?.configured;
    videoInviteCardButton.disabled = !runtimeConfig.inviteCard?.configured;

    if (!runtimeConfig.memberEvent?.configured) {
      renderActionMessage(
        memberSubscriptionResult,
        `缺少 ${runtimeConfig.memberEvent?.missingKeys.join(", ")}，无法开通会员`,
        "message-warn"
      );
    }

    if (!runtimeConfig.inviteCard?.configured) {
      renderActionMessage(
        videoInviteCardResult,
        `缺少 ${runtimeConfig.inviteCard?.missingKeys.join(", ")}，无法下发邀请卡`,
        "message-warn"
      );
    }

    return;
  }

  setStatus(`缺少 ${runtimeConfig.missingKeys.join(", ")}`, "blocked");
  submitButton.disabled = true;
  clearWalletButton.disabled = true;
  sayhiCountButton.disabled = true;
  auditStatusButton.disabled = true;
  freeOneMinuteButton.disabled = true;
  streamerPpvAuditButton.disabled = true;
  anchorPasswordButton.disabled = true;
  memberSubscriptionButton.disabled = true;
  videoInviteCardButton.disabled = true;
  renderActionMessage(memberSubscriptionResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法开通会员`, "message-warn");
  renderActionMessage(sayhiCountResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法更新sayhi次数`, "message-warn");
  renderActionMessage(videoInviteCardResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法下发邀请卡`, "message-warn");
  renderActionMessage(freeOneMinuteResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法刷新免费一分钟`, "message-warn");
  renderActionMessage(streamerPpvAuditResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法执行主播pp审核`, "message-warn");
  renderActionMessage(anchorPasswordResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法设置主播账户密码`, "message-warn");
  renderActionMessage(auditStatusResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法更新防审核状态`, "message-warn");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = userIdInput.value.trim();
  const balance = balanceInput.value.trim();

  if (!/^\d{1,18}$/.test(userId)) {
    renderError("UID 只能包含数字");
    userIdInput.focus();
    return;
  }

  if (!/^\d{1,12}$/.test(balance)) {
    renderError("目标余额只能填写 0 到 999999999999 之间的整数");
    balanceInput.focus();
    return;
  }

  const confirmed = window.confirm(`确认将 UID ${userId} 的金币余额设置为 ${balance}？`);

  if (!confirmed) {
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "执行中";
  result.className = "empty-state message-info";
  result.textContent = "正在执行";

  try {
    const response = await fetch("/api/wallets/set-balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        balance,
        confirm: true
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "执行失败");
    }

    renderSuccess(payload);
  } catch (error) {
    renderError(error.message);
  } finally {
    submitButton.disabled = !runtimeConfig.configured;
    submitButton.textContent = "执行更新";
  }
});

walletClearForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = clearWalletUserIdInput.value.trim();

  if (!/^\d{1,18}$/.test(userId)) {
    renderError("UID 只能包含数字");
    clearWalletUserIdInput.focus();
    return;
  }

  if (!runtimeConfig.configured) {
    renderError(`缺少 ${runtimeConfig.missingKeys.join(", ")}，无法执行清空`);
    return;
  }

  const confirmed = window.confirm(`确认将 UID ${userId} 的金币余额清空为 0？`);

  if (!confirmed) {
    return;
  }

  clearWalletButton.disabled = true;
  clearWalletButton.textContent = "执行中";
  result.className = "empty-state message-info";
  result.textContent = "正在执行";

  try {
    const response = await fetch("/api/wallets/clear-balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        confirm: true
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "执行失败");
    }

    renderWalletActionSuccess(result, payload);
  } catch (error) {
    renderError(error.message);
  } finally {
    clearWalletButton.disabled = !runtimeConfig.configured;
    clearWalletButton.textContent = "清空金币";
  }
});

sayhiQueryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = sayhiQueryUserIdInput.value.trim();

  if (!/^\d{1,18}$/.test(userId)) {
    renderSayhiQueryError("UID 只能包含数字");
    sayhiQueryUserIdInput.focus();
    return;
  }

  if (!runtimeConfig.sayhiQuery?.mongoConfigured) {
    renderSayhiQueryError(`缺少 ${runtimeConfig.sayhiQuery?.missingMongoKeys.join(", ")}，无法执行查询`);
    return;
  }

  querySayhiButton.disabled = true;
  querySayhiButton.textContent = "查询中";
  renderSayhiQueryMessage("正在查询");

  try {
    const response = await fetch(`/api/sayhi-records?userId=${encodeURIComponent(userId)}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "查询失败");
    }

    renderSayhiQuerySuccess(payload);
  } catch (error) {
    renderSayhiQueryError(error.message);
  } finally {
    querySayhiButton.disabled = !runtimeConfig.sayhiQuery?.mongoConfigured;
    querySayhiButton.textContent = "查询数据";
  }
});

deleteSayhiForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = deleteSayhiUserIdInput.value.trim();

  if (!/^\d{1,18}$/.test(userId)) {
    renderActionError(deleteSayhiResult, "user_id 只能包含数字");
    deleteSayhiUserIdInput.focus();
    return;
  }

  if (!runtimeConfig.sayhiQuery?.mongoConfigured) {
    renderActionError(deleteSayhiResult, `缺少 ${runtimeConfig.sayhiQuery?.missingMongoKeys.join(", ")}，无法删除sayhi数据`);
    return;
  }

  const confirmed = window.confirm(`确认删除 user_id ${userId} 的 sayhi 数据？`);

  if (!confirmed) {
    return;
  }

  deleteSayhiButton.disabled = true;
  deleteSayhiButton.textContent = "执行中";
  renderActionMessage(deleteSayhiResult, "正在执行");

  try {
    const response = await fetch("/api/sayhi-records/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        confirm: true
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "执行失败");
    }

    renderDeleteSayhiResult("成功", payload.userId, payload.totalDeleted);
  } catch (error) {
    renderDeleteSayhiResult("失败", userId, 0, error.message);
  } finally {
    deleteSayhiButton.disabled = !runtimeConfig.sayhiQuery?.mongoConfigured;
    deleteSayhiButton.textContent = "删除sayhi数据";
  }
});

memberSubscriptionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = memberUserIdInput.value.trim();
  const duration = memberDurationInput.value.trim();

  if (!/^\d{1,18}$/.test(userId)) {
    renderActionError(memberSubscriptionResult, "UID 只能包含数字");
    memberUserIdInput.focus();
    return;
  }

  if (!/^\d{1,12}$/.test(duration) || Number(duration) <= 0) {
    renderActionError(memberSubscriptionResult, "时长只能填写 1 到 999999999999 秒之间的整数");
    memberDurationInput.focus();
    return;
  }

  if (!runtimeConfig.configured) {
    renderActionError(memberSubscriptionResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法开通会员`);
    return;
  }

  if (!runtimeConfig.memberEvent?.configured) {
    renderActionError(memberSubscriptionResult, `缺少 ${runtimeConfig.memberEvent?.missingKeys.join(", ")}，无法开通会员`);
    return;
  }

  const confirmed = window.confirm(`确认给 UID ${userId} 开通 ${duration} 秒会员？`);

  if (!confirmed) {
    return;
  }

  memberSubscriptionButton.disabled = true;
  memberSubscriptionButton.textContent = "执行中";
  renderActionMessage(memberSubscriptionResult, "正在执行");

  try {
    const response = await fetch("/api/member-subscription/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        duration,
        confirm: true
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "执行失败");
    }

    renderMemberSubscriptionSuccess(payload);
  } catch (error) {
    renderMemberSubscriptionError(duration, error.message);
  } finally {
    memberSubscriptionButton.disabled = !canRunMemberSubscription();
    memberSubscriptionButton.textContent = "开通会员";
  }
});

sayhiCountForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = sayhiCountUserIdInput.value.trim();
  const count = sayhiCountInput.value.trim();

  if (!/^\d{1,18}$/.test(userId)) {
    renderActionError(sayhiCountResult, "UID 只能包含数字");
    sayhiCountUserIdInput.focus();
    return;
  }

  if (!/^\d{1,12}$/.test(count) || Number(count) <= 0) {
    renderActionError(sayhiCountResult, "sayhi次数只能填写 1 到 999999999999 之间的整数");
    sayhiCountInput.focus();
    return;
  }

  if (!runtimeConfig.configured) {
    renderActionError(sayhiCountResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法更新sayhi次数`);
    return;
  }

  const confirmed = window.confirm(`确认将 UID ${userId} 的 sayhi count 设置为 ${count}？`);

  if (!confirmed) {
    return;
  }

  sayhiCountButton.disabled = true;
  sayhiCountButton.textContent = "执行中";
  renderActionMessage(sayhiCountResult, "正在执行");

  try {
    const response = await fetch("/api/sayhi-count/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        count,
        confirm: true
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "执行失败");
    }

    renderSayhiCountSuccess(payload);
  } catch (error) {
    renderActionError(sayhiCountResult, error.message);
  } finally {
    sayhiCountButton.disabled = !runtimeConfig.configured;
    sayhiCountButton.textContent = "更新sayhi次数";
  }
});

videoInviteCardForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = inviteCardUserIdInput.value.trim();
  const streamerId = inviteCardStreamerIdInput.value.trim();
  const streamerToken = inviteCardStreamerTokenInput.value.trim();

  if (!/^\d{1,18}$/.test(userId)) {
    renderActionError(videoInviteCardResult, "用户 UID 只能包含数字");
    inviteCardUserIdInput.focus();
    return;
  }

  if (!/^\d{1,18}$/.test(streamerId)) {
    renderActionError(videoInviteCardResult, "主播 UID 只能包含数字");
    inviteCardStreamerIdInput.focus();
    return;
  }

  if (streamerToken === "") {
    renderActionError(videoInviteCardResult, "主播 token 不能为空");
    inviteCardStreamerTokenInput.focus();
    return;
  }

  if (!runtimeConfig.configured) {
    renderActionError(videoInviteCardResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法下发邀请卡`);
    return;
  }

  if (!runtimeConfig.inviteCard?.configured) {
    renderActionError(videoInviteCardResult, `缺少 ${runtimeConfig.inviteCard?.missingKeys.join(", ")}，无法下发邀请卡`);
    return;
  }

  const confirmed = window.confirm(`确认给用户 UID ${userId} 下发主播 UID ${streamerId} 的视频邀请卡？`);

  if (!confirmed) {
    return;
  }

  videoInviteCardButton.disabled = true;
  videoInviteCardButton.textContent = "执行中";
  renderActionMessage(videoInviteCardResult, "正在执行");

  try {
    const response = await fetch("/api/video-invite-card/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        streamerId,
        streamerToken,
        confirm: true
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "执行失败");
    }

    renderVideoInviteCardResult("成功", payload.userId, payload.streamerId);
  } catch (error) {
    renderVideoInviteCardResult("失败", userId, streamerId, error.message);
  } finally {
    videoInviteCardButton.disabled = !canRunVideoInviteCard();
    videoInviteCardButton.textContent = "下发邀请卡";
  }
});

freeOneMinuteCallForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = freeOneMinuteUserIdInput.value.trim();

  if (!/^\d{1,18}$/.test(userId)) {
    renderActionError(freeOneMinuteResult, "userid 只能包含数字");
    freeOneMinuteUserIdInput.focus();
    return;
  }

  if (!runtimeConfig.configured) {
    renderActionError(freeOneMinuteResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法刷新免费一分钟`);
    return;
  }

  const confirmed = window.confirm(`确认刷新 userid ${userId} 的免费一分钟？`);

  if (!confirmed) {
    return;
  }

  freeOneMinuteButton.disabled = true;
  freeOneMinuteButton.textContent = "执行中";
  renderActionMessage(freeOneMinuteResult, "正在执行");

  try {
    const response = await fetch("/api/free-one-minute-call/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        confirm: true
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "执行失败");
    }

    renderFreeOneMinuteResult("成功", payload.userId);
  } catch (error) {
    renderFreeOneMinuteResult("失败", userId, error.message);
  } finally {
    freeOneMinuteButton.disabled = !runtimeConfig.configured;
    freeOneMinuteButton.textContent = "刷新免费一分钟";
  }
});

streamerPpvAuditForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = streamerPpvUserIdInput.value.trim();
  const status = streamerPpvStatusSelect.value;
  const count = streamerPpvCountInput.value.trim();
  const statusName = {
    200: "审核通过",
    300: "审核拒绝"
  }[status] ?? "未知";

  if (!/^\d{1,18}$/.test(userId)) {
    renderActionError(streamerPpvAuditResult, "主播 UID 只能包含数字");
    streamerPpvUserIdInput.focus();
    return;
  }

  if (!runtimeConfig.configured) {
    renderActionError(streamerPpvAuditResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法执行主播pp审核`);
    return;
  }

  if (!["200", "300"].includes(status)) {
    renderActionError(streamerPpvAuditResult, "审核状态只能选择审核通过或审核拒绝");
    streamerPpvStatusSelect.focus();
    return;
  }

  if (!/^\d{1,6}$/.test(count) || Number(count) <= 0) {
    renderActionError(streamerPpvAuditResult, "审核数量只能填写 1 到 999999 之间的整数");
    streamerPpvCountInput.focus();
    return;
  }

  const confirmed = window.confirm(`确认将主播 UID ${userId} 的 ${count} 张 pp 设置为${statusName}？`);

  if (!confirmed) {
    return;
  }

  streamerPpvAuditButton.disabled = true;
  streamerPpvAuditButton.textContent = "执行中";
  renderActionMessage(streamerPpvAuditResult, "正在执行");

  try {
    const response = await fetch("/api/streamer-ppv/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        status,
        count,
        confirm: true
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "执行失败");
    }

    renderStreamerPpvAuditResult(
      payload.result.status,
      payload.userId,
      payload.result.successCount,
      payload.result.failureCount,
      payload.result.failureReason
    );
  } catch (error) {
    renderStreamerPpvAuditResult("失败", userId, 0, Number(count) || 1, error.message);
  } finally {
    streamerPpvAuditButton.disabled = !runtimeConfig.configured;
    streamerPpvAuditButton.textContent = "审核";
  }
});

anchorPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userId = anchorPasswordUserIdInput.value.trim();

  if (!/^\d{1,18}$/.test(userId)) {
    renderActionError(anchorPasswordResult, "主播 UID 只能包含数字");
    anchorPasswordUserIdInput.focus();
    return;
  }

  if (!runtimeConfig.configured) {
    renderActionError(anchorPasswordResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法设置主播账户密码`);
    return;
  }

  const confirmed = window.confirm(`确认设置主播 UID ${userId} 的账户密码？`);

  if (!confirmed) {
    return;
  }

  anchorPasswordButton.disabled = true;
  anchorPasswordButton.textContent = "执行中";
  renderActionMessage(anchorPasswordResult, "正在执行");

  try {
    const response = await fetch("/api/anchor-password/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        confirm: true
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "执行失败");
    }

    renderAnchorPasswordResult(payload.result.status, payload.userId, payload.number, payload.password);
  } catch (error) {
    renderAnchorPasswordResult("失败", userId, "未找到", "未返回", error.message);
  } finally {
    anchorPasswordButton.disabled = !runtimeConfig.configured;
    anchorPasswordButton.textContent = "设置密码";
  }
});

iosPackageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const appName = iosPackageAppNameInput.value.trim();

  if (!/^[\p{L}\p{N} ._-]{1,128}$/u.test(appName)) {
    renderActionError(iosPackageResult, "app_name 只能包含字母、数字、空格、点、下划线或中划线，长度不能超过 128");
    iosPackageAppNameInput.focus();
    return;
  }

  iosPackageButton.disabled = true;
  iosPackageButton.textContent = "查询中";
  renderActionMessage(iosPackageResult, "正在查询");

  try {
    const response = await fetch(`/api/app-package/info?app_name=${encodeURIComponent(appName)}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "查询失败");
    }

    renderIosPackageSuccess(payload);
  } catch (error) {
    renderActionError(iosPackageResult, error.message);
  } finally {
    iosPackageButton.disabled = false;
    iosPackageButton.textContent = "查询状态";
  }
});

auditStatusForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const appName = auditAppNameInput.value.trim();
  const auditedAt = auditedAtSelect.value;
  const modeName = auditedAt === "0" ? "审核模式" : "非审核模式";

  if (!/^[\p{L}\p{N} ._-]{1,128}$/u.test(appName)) {
    renderActionError(auditStatusResult, "appname 只能包含字母、数字、空格、点、下划线或中划线，长度不能超过 128");
    auditAppNameInput.focus();
    return;
  }

  if (!["0", "1"].includes(auditedAt)) {
    renderActionError(auditStatusResult, "防审核状态只能选择审核模式或非审核模式");
    auditedAtSelect.focus();
    return;
  }

  if (!runtimeConfig.configured) {
    renderActionError(auditStatusResult, `缺少 ${runtimeConfig.missingKeys.join(", ")}，无法更新防审核状态`);
    return;
  }

  const confirmed = window.confirm(`确认将 appname ${appName} 设置为${modeName}？`);

  if (!confirmed) {
    return;
  }

  auditStatusButton.disabled = true;
  auditStatusButton.textContent = "执行中";
  renderActionMessage(auditStatusResult, "正在执行");

  try {
    const response = await fetch("/api/audit-status/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        appName,
        auditedAt,
        confirm: true
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "执行失败");
    }

    renderAuditStatusSuccess(payload);
  } catch (error) {
    renderActionError(auditStatusResult, error.message);
  } finally {
    auditStatusButton.disabled = !runtimeConfig.configured;
    auditStatusButton.textContent = "更新状态";
  }
});

for (const item of directoryItems) {
  item.addEventListener("click", (event) => {
    const tabId = item.dataset.tab;
    activateTab(tabId);
  });
}

window.addEventListener("hashchange", () => {
  activateRoute(window.location.hash);
});

for (const button of subtabButtons) {
  button.addEventListener("click", () => {
    activateSubtab(button.dataset.subtab);
  });
}

activateRoute(window.location.hash);

loadRuntimeConfig().catch((error) => {
  setStatus("服务异常", "blocked");
  renderError(error.message);
});
