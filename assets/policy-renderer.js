(function () {
  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === "string") el.textContent = text;
    return el;
  }

  function htmlToText(html) {
    var temp = document.createElement("div");
    temp.innerHTML = html;
    return (temp.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function appendLegacyBody(section, body) {
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

  function appendSectionBody(section, body) {
    if (typeof section.html === "string" && section.html.trim()) {
      var wrapper = createEl("div", "policy-section-content");
      wrapper.innerHTML = section.html;
      body.appendChild(wrapper);
      return;
    }
    appendLegacyBody(section, body);
  }

  function summarizeSection(section) {
    if (typeof section.html === "string" && section.html.trim()) {
      var compact = htmlToText(section.html);
      return compact.length > 140 ? compact.slice(0, 140) + "..." : compact;
    }

    var summaryParts = [];
    if (section.paragraphs && section.paragraphs.length > 0) {
      summaryParts.push(section.paragraphs[0]);
    }
    if (section.list && section.list.length > 0) {
      summaryParts.push("主な項目: " + section.list.slice(0, 3).join(" / "));
    }
    return summaryParts.join(" ");
  }

  function hasSelectedCategory(section, selectedCategories) {
    if (!selectedCategories || selectedCategories.length === 0) return true;
    var categories = section.categories || [];
    if (categories.length === 0) return true;
    return selectedCategories.some(function (category) {
      return categories.indexOf(category) !== -1;
    });
  }

  function sectionSearchText(section) {
    var chunks = [section.title || ""];

    if (typeof section.html === "string" && section.html.trim()) {
      chunks.push(htmlToText(section.html));
    }
    if (section.paragraphs) {
      chunks = chunks.concat(section.paragraphs);
    }
    if (section.list) {
      chunks = chunks.concat(section.list);
    }

    return chunks.join(" ").toLowerCase();
  }

  function hasKeyword(section, keyword) {
    if (!keyword) return true;
    return sectionSearchText(section).indexOf(keyword.toLowerCase()) !== -1;
  }

  function filterSections(sections, filterState) {
    var categories = filterState.categories || [];
    var keyword = (filterState.keyword || "").trim();

    return sections.filter(function (section) {
      return hasSelectedCategory(section, categories) && hasKeyword(section, keyword);
    });
  }

  function renderSectionList(sections, body) {
    sections.forEach(function (section) {
      body.appendChild(createEl("h3", "", section.title));
      appendSectionBody(section, body);
    });
  }

  function renderFullPolicy(data, root, filterState) {
    root.innerHTML = "";

    var filteredTerms = filterSections(data.termsSections, filterState);
    var filteredPrivacy = filterSections(data.privacySections, filterState);

    var termsTitle = createEl("h2", "", data.termsTitle);
    root.appendChild(termsTitle);
    var termsBody = createEl("div", "policy-body");
    if (filteredTerms.length === 0) {
      termsBody.appendChild(createEl("p", "", "該当する項目はありません。"));
    } else {
      renderSectionList(filteredTerms, termsBody);
    }
    root.appendChild(termsBody);

    root.appendChild(createEl("hr", "policy-separator"));

    var privacyTitle = createEl("h2", "", data.privacyTitle);
    root.appendChild(privacyTitle);
    var privacyBody = createEl("div", "policy-body");
    if (filteredPrivacy.length === 0) {
      privacyBody.appendChild(createEl("p", "", "該当する項目はありません。"));
    } else {
      renderSectionList(filteredPrivacy, privacyBody);
    }
    root.appendChild(privacyBody);
  }

  function setupCategoryFilters(container, categories, onChange, initialState) {
    if (!container) return;
    container.innerHTML = "";

    var state = initialState || { categories: [], keyword: "" };

    var label = createEl("p", "policy-filter-label", "絞り込み");
    container.appendChild(label);

    var toolbar = createEl("div", "policy-filter-toolbar");
    var search = createEl("input", "policy-filter-search");
    search.type = "search";
    search.placeholder = "見出し・本文で検索";
    search.value = state.keyword || "";
    toolbar.appendChild(search);

    var actions = createEl("div", "policy-filter-actions");
    var selectAll = createEl("button", "policy-filter-action", "全選択");
    selectAll.type = "button";
    var clearAll = createEl("button", "policy-filter-action", "全解除");
    clearAll.type = "button";
    actions.appendChild(selectAll);
    actions.appendChild(clearAll);
    toolbar.appendChild(actions);

    container.appendChild(toolbar);

    var optionWrap = createEl("div", "policy-filter-options");
    var checkboxes = [];

    categories.forEach(function (category, index) {
      var option = createEl("label", "policy-filter-option");
      var input = createEl("input");
      input.type = "checkbox";
      input.value = category;
      input.id = "policy-filter-" + index;
      input.checked = (state.categories || []).indexOf(category) !== -1;

      var text = createEl("span", "", category);
      option.appendChild(input);
      option.appendChild(text);
      optionWrap.appendChild(option);
      checkboxes.push(input);
    });

    container.appendChild(optionWrap);

    function getSelected() {
      return checkboxes
        .filter(function (checkbox) {
          return checkbox.checked;
        })
        .map(function (checkbox) {
          return checkbox.value;
        });
    }

    function emit() {
      onChange({
        categories: getSelected(),
        keyword: search.value.trim()
      });
    }

    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", emit);
    });
    search.addEventListener("input", emit);

    selectAll.addEventListener("click", function () {
      checkboxes.forEach(function (checkbox) {
        checkbox.checked = true;
      });
      emit();
    });

    clearAll.addEventListener("click", function () {
      checkboxes.forEach(function (checkbox) {
        checkbox.checked = false;
      });
      search.value = "";
      emit();
    });
  }

  function renderAppPolicy(data, root) {
    var termsTitle = createEl("h1", "", data.termsTitle);
    root.appendChild(termsTitle);
    data.termsSections.forEach(function (section) {
      root.appendChild(createEl("h2", "", section.title));
      appendSectionBody(section, root);
    });

    root.appendChild(createEl("hr", "policy-separator"));

    var privacyTitle = createEl("h1", "", data.privacyTitle);
    root.appendChild(privacyTitle);
    data.privacySections.forEach(function (section) {
      root.appendChild(createEl("h2", "", section.title));
      appendSectionBody(section, root);
    });
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
    if (mode === "app") {
      renderAppPolicy(data, root);
      return;
    }

    var filterCategories = options.filterCategories || data.filterCategories || [];
    var filterContainer = document.getElementById(options.filterContainerId || "");
    var filterState = {
      categories: (options.initialSelectedCategories || []).slice(),
      keyword: options.initialKeyword || ""
    };

    if (filterContainer && filterCategories.length > 0) {
      setupCategoryFilters(
        filterContainer,
        filterCategories,
        function (state) {
          filterState = state;
          renderFullPolicy(data, root, filterState);
        },
        filterState
      );
    }

    renderFullPolicy(data, root, filterState);
  };
})();
