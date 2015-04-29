
// Format:
// [ text, selector type, multiplier, normalized ]
// If normalized == true, then everyone's scores
// are re-scaled to sum to 1
// Params within one param set are additive,
// params within different param sets are multiplicative
//
// For example, if there is a param with values:
//
// [
//    ['qwruqgrgqwr', 'foo', 2, false],
//    ['hquwrhqwrqwrqwr', 'bar', 5, true]
// ]
//
// With window.selectors = { 
//     foo: { 'a': 1, 'b': 2},
//     bar: { 'x': 2, 'y': 5, 'z': 13},
// }
//
// Then, if we have two people, Bob and George, where
// Bob submits 'a' for foo and 'x' for bar, and George
// submits 'b' for foo and 'z' for bar, then we have total
// pre-scores for foo: { Bob: 1, George: 2 }, and for bar:
// { Bob: 2, George: 13 }. We then normalize bar to
// { Bob: 0.13333, George: 0.86667 }, and then make a
// combined score { Bob: 1.13333, George: 1.86667 }. We
// take the combined scores for each param and multiply
// them together to provide each person's final score, which
// we use to proportionately split the total amount.

window.params = [
    // One param set, not normalized
    {
        text: "",
        values: [
            ['Provide your skill level', 'skill', 1, false],
            ['Are you in leadership?', 'leadership', 1, false],
        ]
    },
    // Another param set, normalized
    {
        text: "How much did you work in:",
        values: [
            ['November', 'time', 0.25, true],
            ['December', 'time', 1, true],
            ['January', 'time', 1, true],
            ['February', 'time', 1, true],
            ['March', 'time', 1, true],
        ]
    }
]

window.selectors = {
    time: [
        [0, 'None'],
        [0.25, 'Minimal'],
        [0.5, 'Half-time'],
        [1, 'Full-time']
    ],
    leadership: [
        [0, 'No'],
        [0.25, 'Yes']
    ],
    skill: [
        [1, 'Regular'],
        [1.33, 'Professional'],
        [1.67, 'Master'],
        [2, 'Grandmaster'],
        [2.5, 'Satoshi'],
    ]
}
