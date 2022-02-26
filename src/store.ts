import { writable } from 'svelte/store';

const storedUser = JSON.parse(localStorage.getItem('user'));
export const user = writable(storedUser);
user.subscribe(value => {
    localStorage.setItem('user', JSON.stringify(value));
});
