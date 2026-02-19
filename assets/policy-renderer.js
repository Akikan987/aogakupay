(function () {
  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === "string") el.textContent = text;
    return el;
  }

  function appendSectionBody(section, body) {
    (section.paragraphs || []).forEach(function (paragraph) {
      body.appendChild(createEl("p", "", paragraph));
    });
    if (section.list && section.list.length > 0) {
      var ul = createEl("ul");
      section.list.forEach(function (item) {
        ul.appendChild(createEl("li", "", item));
      });
      body.appendChild(ul);
    }
  }

  function summarizeSection(section) {
    var summaryParts = [];
    if (section.paragraphs && section.paragraphs.length > 0) {
      summaryParts.push(section.paragraphs[0]);
    }
    if (section.list && section.list.length > 0) {
      summaryParts.push("主な項目: " + section.list.slice(0, 3).join(" / "));
    }
    return summaryParts.join(" ");
  }

  function renderFullPolicy(data, root) {
    var termsTitle = createEl("h2", "", data.termsTitle);
    root.appendChild(termsTitle);
    var termsBody = createEl("div", "policy-body");
    data.termsSections.forEach(function (section) {
      termsBody.appendChild(createEl("h3", "", section.title));
      appendSectionBody(section, termsBody);
    });
    root.appendChild(termsBody);

    var privacyTitle = createEl("h2", "", data.privacyTitle);
    root.appendChild(privacyTitle);
    var privacyBody = createEl("div", "policy-body");
    data.privacySections.forEach(function (section) {
      privacyBody.appendChild(createEl("h3", "", section.title));
      appendSectionBody(section, privacyBody);
    });
    root.appendChild(privacyBody);
  }

  function renderCompactPolicy(data, root) {
    var compactLead = createEl(
      "p",
      "section-lead",
      "このページはアプリ内表示向けの簡易版です。詳細は通常版の利用規約・プライバシーポリシーをご確認ください。"
    );
    root.appendChild(compactLead);

    var detailsLink = createEl("p", "");
    var anchor = createEl("a", "utility-link", "通常版を開く");
    anchor.href = "terms.html";
    detailsLink.appendChild(anchor);
    root.appendChild(detailsLink);

    var termsTitle = createEl("h2", "", data.termsTitle + "（要点）");
    root.appendChild(termsTitle);
    var termsList = createEl("div", "policy-compact-list");
    data.termsSections.forEach(function (section) {
      var item = createEl("article", "policy-compact-item");
      item.appendChild(createEl("h3", "", section.title));
      item.appendChild(createEl("p", "", summarizeSection(section)));
      termsList.appendChild(item);
    });
    root.appendChild(termsList);

    var privacyTitle = createEl("h2", "", data.privacyTitle + "（要点）");
    root.appendChild(privacyTitle);
    var privacyList = createEl("div", "policy-compact-list");
    data.privacySections.forEach(function (section) {
      var item = createEl("article", "policy-compact-item");
      item.appendChild(createEl("h3", "", section.title));
      item.appendChild(createEl("p", "", summarizeSection(section)));
      privacyList.appendChild(item);
    });
    root.appendChild(privacyList);
  }

  window.renderAogakuPolicy = function (options) {
    var data = window.AOGAKU_POLICY_DATA;
    if (!data) return;

    var mountId = options.mountId;
    var mode = options.mode || "full";
    var root = document.getElementById(mountId);
    if (!root) return;

    var updatedAt = document.getElementById(options.updatedAtId || "");
    if (updatedAt) {
      updatedAt.textContent = data.updatedAt;
    }

    if (mode === "compact") {
      renderCompactPolicy(data, root);
      return;
    }
    renderFullPolicy(data, root);
  };
})();
