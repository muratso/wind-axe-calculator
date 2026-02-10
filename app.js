/**
 * Wind Axe Craft Calculator - Ragnarok M: Classic Global
 *
 * Recipe data:
 *   1 Wind Axe = 50 Rough Wind + 120 Steel + 30 BMO + 400 MGF + 100 Element Alloy
 *   1 Element Alloy = 1 Steel + 1 Coal + 1 BMO + 5 MGF
 *
 * Combined raw materials for 1 Wind Axe:
 *   Rough Wind: 50
 *   Steel: 120 (direct) + 100 (from alloys) = 220
 *   Coal: 100 (from alloys)
 *   BMO: 30 (direct) + 100 (from alloys) = 130
 *   MGF: 400 (direct) + 500 (from alloys) = 900
 */

(function () {
  "use strict";

  // ---- Recipe constants (per 1 Wind Axe) ----
  const WIND_AXE_RECIPE = {
    roughWind: 50,
    steel: 120,
    bmo: 30,
    mgf: 400,
    elementAlloy: 100,
  };

  // Per 1 Element Alloy
  const ELEMENT_ALLOY_RECIPE = {
    steel: 1,
    coal: 1,
    bmo: 1,
    mgf: 5,
  };

  // ---- DOM References ----
  const dom = {
    axeCount: document.getElementById("axe-count"),
    btnMinus: document.getElementById("btn-minus"),
    btnPlus: document.getElementById("btn-plus"),

    // Badges
    axeBadge: document.getElementById("axe-badge"),
    alloyBadge: document.getElementById("alloy-badge"),

    // Price inputs (editable)
    priceRoughWind: document.getElementById("price-rough-wind"),
    priceSteel: document.getElementById("price-steel"),
    priceBmo: document.getElementById("price-bmo"),
    priceMgf: document.getElementById("price-mgf"),
    priceCoal: document.getElementById("price-coal"),

    // Shared price displays in the Element Alloy section
    // (mirrors the prices from Wind Axe section, read-only)
    sharedPriceSteel: document.getElementById("shared-price-steel"),
    sharedPriceBmo: document.getElementById("shared-price-bmo"),
    sharedPriceMgf: document.getElementById("shared-price-mgf"),

    // Wind Axe quantities
    qtyRoughWind: document.getElementById("qty-rough-wind"),
    qtySteel: document.getElementById("qty-steel"),
    qtyBmo: document.getElementById("qty-bmo"),
    qtyMgf: document.getElementById("qty-mgf"),
    qtyElementAlloy: document.getElementById("qty-element-alloy"),

    // Wind Axe costs
    costRoughWind: document.getElementById("cost-rough-wind"),
    costSteel: document.getElementById("cost-steel"),
    costBmo: document.getElementById("cost-bmo"),
    costMgf: document.getElementById("cost-mgf"),
    costElementAlloy: document.getElementById("cost-element-alloy"),

    // Element Alloy quantities
    qtyAlloySteel: document.getElementById("qty-alloy-steel"),
    qtyAlloyCoal: document.getElementById("qty-alloy-coal"),
    qtyAlloyBmo: document.getElementById("qty-alloy-bmo"),
    qtyAlloyMgf: document.getElementById("qty-alloy-mgf"),

    // Element Alloy costs
    costAlloySteel: document.getElementById("cost-alloy-steel"),
    costAlloyCoal: document.getElementById("cost-alloy-coal"),
    costAlloyBmo: document.getElementById("cost-alloy-bmo"),
    costAlloyMgf: document.getElementById("cost-alloy-mgf"),

    // Totals
    totalWindAxe: document.getElementById("total-wind-axe"),
    totalElementAlloy: document.getElementById("total-element-alloy"),

    // Grand total summary
    totalRoughWind: document.getElementById("total-rough-wind"),
    totalSteel: document.getElementById("total-steel"),
    totalCoal: document.getElementById("total-coal"),
    totalBmoAll: document.getElementById("total-bmo-all"),
    totalMgfAll: document.getElementById("total-mgf-all"),
    grandTotal: document.getElementById("grand-total"),
  };

  // ---- Helpers ----

  /** Format number with dot as thousands separator (Brazilian style) */
  function fmt(num) {
    return num.toLocaleString("pt-BR");
  }

  /** Safely parse an integer from an input, defaulting to 0 */
  function parseInput(el) {
    var val = parseInt(el.value, 10);
    return isNaN(val) || val < 0 ? 0 : val;
  }

  /** Add a brief animation class to indicate a value changed */
  function animateElement(el) {
    el.classList.remove("value-changed");
    // Force reflow so the animation restarts
    void el.offsetWidth;
    el.classList.add("value-changed");
  }

  /** Update text content of an element and animate it */
  function updateText(el, value) {
    var formatted = fmt(value);
    if (el.textContent !== formatted) {
      el.textContent = formatted;
      animateElement(el);
    }
  }

  /**
   * Update a total element that contains a zeny <span> child.
   * Sets the text to "VALUE <span class='zeny'>z</span>" format.
   */
  function updateTotal(el, value) {
    var formatted = fmt(value);
    // Preserve the zeny span inside the element
    var zenySpan = el.querySelector(".zeny");
    if (zenySpan) {
      // Only update the text node before the zeny span
      var textNode = el.firstChild;
      if (textNode && textNode.nodeType === 3) {
        if (textNode.textContent !== formatted + " ") {
          textNode.textContent = formatted + " ";
          animateElement(el);
        }
      }
    } else {
      // Fallback: set plain text
      if (el.textContent !== formatted) {
        el.textContent = formatted;
        animateElement(el);
      }
    }
  }

  // ---- Main Calculation ----
  function recalculate() {
    var count = Math.max(1, parseInput(dom.axeCount));

    // Read prices from inputs
    var prices = {
      roughWind: parseInput(dom.priceRoughWind),
      steel: parseInput(dom.priceSteel),
      bmo: parseInput(dom.priceBmo),
      mgf: parseInput(dom.priceMgf),
      coal: parseInput(dom.priceCoal),
    };

    // Mirror prices to the shared-price displays in Element Alloy section
    updateText(dom.sharedPriceSteel, prices.steel);
    updateText(dom.sharedPriceBmo, prices.bmo);
    updateText(dom.sharedPriceMgf, prices.mgf);

    // --- Element Alloy sub-craft ---
    var totalAlloys = WIND_AXE_RECIPE.elementAlloy * count;

    var alloyQtySteel = ELEMENT_ALLOY_RECIPE.steel * totalAlloys;
    var alloyQtyCoal = ELEMENT_ALLOY_RECIPE.coal * totalAlloys;
    var alloyQtyBmo = ELEMENT_ALLOY_RECIPE.bmo * totalAlloys;
    var alloyQtyMgf = ELEMENT_ALLOY_RECIPE.mgf * totalAlloys;

    var alloyCostSteel = alloyQtySteel * prices.steel;
    var alloyCostCoal = alloyQtyCoal * prices.coal;
    var alloyCostBmo = alloyQtyBmo * prices.bmo;
    var alloyCostMgf = alloyQtyMgf * prices.mgf;
    var totalAlloyCost = alloyCostSteel + alloyCostCoal + alloyCostBmo + alloyCostMgf;

    // --- Wind Axe direct materials ---
    var axeQtyRoughWind = WIND_AXE_RECIPE.roughWind * count;
    var axeQtySteel = WIND_AXE_RECIPE.steel * count;
    var axeQtyBmo = WIND_AXE_RECIPE.bmo * count;
    var axeQtyMgf = WIND_AXE_RECIPE.mgf * count;

    var axeCostRoughWind = axeQtyRoughWind * prices.roughWind;
    var axeCostSteel = axeQtySteel * prices.steel;
    var axeCostBmo = axeQtyBmo * prices.bmo;
    var axeCostMgf = axeQtyMgf * prices.mgf;

    // Wind Axe total = direct materials + Element Alloy craft cost
    var totalAxeCost =
      axeCostRoughWind + axeCostSteel + axeCostBmo + axeCostMgf + totalAlloyCost;

    // --- Combined raw materials (for the summary) ---
    var combinedRoughWind = axeQtyRoughWind;
    var combinedSteel = axeQtySteel + alloyQtySteel;
    var combinedCoal = alloyQtyCoal;
    var combinedBmo = axeQtyBmo + alloyQtyBmo;
    var combinedMgf = axeQtyMgf + alloyQtyMgf;

    // ---- Update DOM ----

    // Badges
    dom.axeBadge.textContent = "x" + fmt(count);
    dom.alloyBadge.textContent = "x" + fmt(totalAlloys);

    // Wind Axe quantities
    updateText(dom.qtyRoughWind, axeQtyRoughWind);
    updateText(dom.qtySteel, axeQtySteel);
    updateText(dom.qtyBmo, axeQtyBmo);
    updateText(dom.qtyMgf, axeQtyMgf);
    updateText(dom.qtyElementAlloy, totalAlloys);

    // Wind Axe costs
    updateText(dom.costRoughWind, axeCostRoughWind);
    updateText(dom.costSteel, axeCostSteel);
    updateText(dom.costBmo, axeCostBmo);
    updateText(dom.costMgf, axeCostMgf);
    updateText(dom.costElementAlloy, totalAlloyCost);

    // Element Alloy quantities
    updateText(dom.qtyAlloySteel, alloyQtySteel);
    updateText(dom.qtyAlloyCoal, alloyQtyCoal);
    updateText(dom.qtyAlloyBmo, alloyQtyBmo);
    updateText(dom.qtyAlloyMgf, alloyQtyMgf);

    // Element Alloy costs
    updateText(dom.costAlloySteel, alloyCostSteel);
    updateText(dom.costAlloyCoal, alloyCostCoal);
    updateText(dom.costAlloyBmo, alloyCostBmo);
    updateText(dom.costAlloyMgf, alloyCostMgf);

    // Totals (these contain a nested .zeny span)
    updateTotal(dom.totalWindAxe, totalAxeCost);
    updateTotal(dom.totalElementAlloy, totalAlloyCost);

    // Grand total summary
    updateText(dom.totalRoughWind, combinedRoughWind);
    updateText(dom.totalSteel, combinedSteel);
    updateText(dom.totalCoal, combinedCoal);
    updateText(dom.totalBmoAll, combinedBmo);
    updateText(dom.totalMgfAll, combinedMgf);
    updateText(dom.grandTotal, totalAxeCost);
  }

  // ---- Event Listeners ----

  // Recalculate on any price or quantity input change
  dom.axeCount.addEventListener("input", recalculate);
  dom.priceRoughWind.addEventListener("input", recalculate);
  dom.priceSteel.addEventListener("input", recalculate);
  dom.priceBmo.addEventListener("input", recalculate);
  dom.priceMgf.addEventListener("input", recalculate);
  dom.priceCoal.addEventListener("input", recalculate);

  // +/- buttons for axe count
  dom.btnMinus.addEventListener("click", function () {
    var current = parseInput(dom.axeCount);
    if (current > 1) {
      dom.axeCount.value = current - 1;
      recalculate();
    }
  });

  dom.btnPlus.addEventListener("click", function () {
    var current = parseInput(dom.axeCount);
    dom.axeCount.value = current + 1;
    recalculate();
  });

  // Ensure the input never goes below 1 on blur
  dom.axeCount.addEventListener("blur", function () {
    var val = parseInput(dom.axeCount);
    if (val < 1) {
      dom.axeCount.value = 1;
    }
    recalculate();
  });

  // ---- Initial calculation ----
  recalculate();
})();
