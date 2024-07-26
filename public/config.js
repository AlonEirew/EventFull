const config = {
    app: {
        "includeAxis": true,
        "includeAnchor": false,
        "includeProjection": false,
        "includeTemp": true,
        "includeCoref": true,
        "includeCausal": true,
        "includeSubEvent": false,
        "considerAxisAtAnnotation": [AxisType.MAIN],
        "showRemainingAnnot": true,
        "debug": false,
        "exportAlways": true,
        "removeTransitive": false,
    },
    instFiles: {
        "axis": "axis_inst.html",
        "anchor": "anchor_inst.html",
        "projection": "projection_inst.html",
        "temporal": "temporal_inst.html",
        "coref": "coref_inst.html",
        "subevent": "subevent_inst.html",
        "causal": "causal_inst.html",
    }
};
