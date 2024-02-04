export default {
  Defs: {
    ThingDef: [
      {
        $: { ParentName: "ResourceBase" },
        thingClass: ["ThingWithComps"],
        defName: ["MM_Resource"],
        label: ["Resource"],
        description: ["Resource"],
        statBases: [
          {
            MarketValue: ["1"],
            MaxHitPoints: ["300"],
            Mass: ["1"],
            Flammability: ["0"],
            DeteriorationRate: ["0.0"],
            Beauty: ["2"],
          },
        ],
      },
    ],
  },
};
