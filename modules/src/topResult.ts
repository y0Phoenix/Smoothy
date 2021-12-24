/**
 * @param  {} Array the array you want to sort to find the highest 
 * @requires number with the name dif inside each object entry inside the array 
 * @returns the object that has the lowest dif value
 */
 const topResult = (Array) => {
    let v = 0;
    let j = 0;
    for (let i = 0;
        i < Array.length;
        i++) {
            if (v === 0) {
                v = Array[i].dif;
                j = i;
            }  
            else {
                if (v > Array[i].dif) {
                    v = Array[i].dif;
                    j = i;
                }
        }
    }
    return Array[j];
}