let unique_id = Math.round(new Date().getTime() * 1000 + Math.random() * 1000);
export default function () {
    return unique_id++;
};
