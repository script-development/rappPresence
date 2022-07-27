<template>
    <div>
        <div class="mb-3 xl:w-96 z-1">
            <label for="weather-options"><slot /></label>
            <select id="weather-options" :value="modelValue" :class="selectClass" @input="updateValue">
                <option
                    v-for="option in Object.keys(options)"
                    :key="option"
                    :value="option"
                    :disabled="disabled"
                    :selected="modelValue === option"
                >
                    {{ options[option].title }}
                </option>
            </select>
        </div>
    </div>
</template>

<script setup>
defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    options: {
        type: Object,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue']);

/** @param {Event} evt */
const updateValue = evt => {
    if (evt.target instanceof HTMLSelectElement) emit('update:modelValue', evt.target.value);
};

// Temporarily select classes
const selectClass =
    'appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding' +
    'bg-no-repeat border border-solid border-gray-300 rounded' +
    'transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none';
</script>
