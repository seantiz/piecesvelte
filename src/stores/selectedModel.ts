import { writable } from 'svelte/store';

export const selectedModelStore = writable('');

export const fallbackToModel = async (models: any[]) => {
    // Fallback to GPT 4-o Mini
    const fallback = models.find(model =>
        model.id === 'e1312912-74cb-4bf8-ade2-3d31c1fca10c'
    );

    if (fallback) {
        selectedModelStore.set(fallback.id);
    }
};
