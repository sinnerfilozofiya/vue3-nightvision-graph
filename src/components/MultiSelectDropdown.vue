<template>
  <div class="dropdown-container">
    <label class="dropdown-label" for="indicatorDropdown">Select Financial Indicators:</label>
    <div class="multiselect-bar">
      <div
        v-for="(indicator, index) in selectedIndicators"
        :key="index"
        class="selected-indicator"
      >
        {{ indicator }}
        <button @click="removeIndicator(index)">x</button>
      </div>
    </div>
    <select
      id="indicatorDropdown"
      v-model="selectedIndicators"
      multiple
      @change="updateSelectedIndicators"
    >
      <option disabled value="">Select Indicators</option>
      <option value="ema_ind">Exponential Moving Average (EMA)</option>
      <option value="rsi_ind">Relative Strength Index (RSI)</option>
    </select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedIndicators: [],
    };
  },
  methods: {
    updateSelectedIndicators(event) {
      // The select element's change event doesn't provide the selected values,
      // so we need to manually update the selectedIndicators array
      this.selectedIndicators = Array.from(event.target.selectedOptions, option => option.value);
    },
    removeIndicator(index) {
      this.selectedIndicators.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.dropdown-container {
  display: inline-block;
}
.dropdown-label {
  margin-bottom: 8px;
}
.multiselect-bar {
  display: flex;
  flex-wrap: wrap;
}
.selected-indicator {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 4px;
  margin: 2px;
  border-radius: 4px;
}
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>



