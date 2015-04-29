angular.module('app', []);

var el = function(x) { return document.getElementById(x); }
var qs = function(x) { return document.querySelectorAll(x); }

function AppCtrl($scope,$http) {
    window.wscope = $scope;
    window.whttp = $http;
    $scope.ctx = document.getElementById("preminechart").getContext("2d");
    $scope.params = window.params;
    $scope.selectors = window.selectors;

    $scope.value = 15000000
    $scope.me = { name: '', values: [] }
    for (var i = 0; i < $scope.params.length; i++) {
        var o = [];
        for (var j = 0; j < $scope.params[i].values.length; j++) o[j] = 0;
        $scope.me.values[i] = o;
    }

    $scope.calc_scores = function(people) {
        var scores = [];
        for (var j = 0; j < people.length; j++) scores[j] = 1;
        // For each param group
        for (var i = 0; i < window.params.length; i++) {
            var subscores = [];
            for (var j = 0; j < people.length; j++) subscores[j] = 0;
            // For each param
            for (var j = 0; j < window.params[i].values.length; j++) {
                var subsubscores = [];
                // Compute numeric score per person
                for (var k = 0; k < people.length; k++) {
                    var selector = window.selectors[window.params[i].values[j][1]]
                    subsubscores[k] = 0;
                    for (var l = 0; l < selector.length; l++) {
                        if (selector[l][1] == people[k].values[i][j]) {
                            subsubscores[k] += selector[l][0];
                        }
                    }
                }
                console.log('subsubscores', subsubscores);
                // Normalize if desired
                if (window.params[i].values[j][3]) {
                    total = 0
                    for (var k = 0; k < people.length; k++) {
                        total += subsubscores[k];
                    }
                    for (var k = 0; k < people.length; k++) {
                        subscores[k] += subsubscores[k] / (total || 0.000001);
                    }
                }
                // Otherwise just add to the per-param-group score
                else {
                    for (var k = 0; k < people.length; k++) {
                        subscores[k] += subsubscores[k];
                    }
                }
                console.log('subscores', subscores);
            }
            // Multiply all per-param-group score sums together to get
            // the final score
            for (var k = 0; k < people.length; k++) {
                scores[k] *= subscores[k];
            }
            console.log('scores', scores);
        }
        var o = [];
        for (var i = 0; i < people.length; i++) {
            o.push({
                name: people[i].name,
                values: people[i].values,
                score: scores[i]
            });
        }
        return o
    }


    var rand = function(mi,ma) {
        return Math.floor(mi+Math.random() * (ma-mi))
    }
    $scope.update = function() {
        console.log('updating')
        $http.get('/get')
            .success(function(people) {
                $scope.people = people
                $scope.scores = $scope.calc_scores(people)
                $scope.scores_json = JSON.stringify($scope.scores)
                $scope.my_score = 0;
                $scope.total_score = 0;
                for (var i = 0; i < $scope.scores.length; i++) {
                    console.log($scope.scores[i]);
                    if ($scope.scores[i].name == $scope.me.name)
                        $scope.my_score = $scope.scores[i].score;
                    $scope.total_score += $scope.scores[i].score;
                }
                console.log($scope.my_score)
                console.log($scope.total_score)
                console.log($scope.value)
                new Chart($scope.ctx).Pie($scope.scores.map(function(s) {
                    var isme = $scope.me.name == s.name;
                    console.log(isme+'rgba('+(isme?64:rand(192,256))+','+rand(192,256)+','+rand(192,256)+',1)')
                    return {
                        color: 'rgba('+(isme?64:rand(192,256))+','+rand(192,256)+','+rand(192,256)+',1)',
                        value: s.score,
                        label: s.name
                    }
                }))
             })
    }
    $scope.update()
    $scope.load = function() {
        $http.get('/me?name='+$scope.me.name)
            .success(function(p) {
                if (typeof p != 'string') {
                    $scope.me = p;
                    $scope.update();
                }
            })
    }
    $scope.submit = function() {
        console.log('submitting', JSON.stringify($scope.me));
        $http.post('/submit',$scope.me)
            .success($scope.update)
            .error(function(e) { alert(e) });
    }
    $scope.setpw = function() {
        $http.post('/setpassword',{ pw: $scope.me.pw, newpw: $scope.pw })
            .success(function() { alert("Password set") })
            .error(function(e) { alert(e) });
    }
}
