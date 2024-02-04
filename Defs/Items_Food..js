export default {
  Defs: {
    ThingDef: [
      {
        $: { Name: "MealBaseIngredientless", Abstract: "True" },
        thingClass: ["ThingWithComps"],
        category: ["Item"],
        drawerType: ["MapMeshOnly"],
        useHitPoints: ["true"],
        healthAffectsPrice: ["false"],
        selectable: ["true"],
        statBases: [
          {
            MaxHitPoints: ["50"],
            Flammability: ["1.0"],
            Beauty: ["0"],
            Mass: ["0.44"],
            DeteriorationRate: ["10"],
          },
        ],
        altitudeLayer: ["Item"],
        stackLimit: ["10"],
        tickerType: ["Rare"],
        socialPropernessMatters: ["true"],
        thingCategories: [{ li: ["FoodMeals"] }],
        alwaysHaulable: ["true"],
        comps: [
          {
            li: [
              { $: { Class: "CompProperties_Forbiddable" } },
              { $: { Class: "CompProperties_FoodPoisonable" } },
            ],
          },
        ],
        pathCost: ["14"],
        allowedArchonexusCount: ["40"],
        resourceReadoutPriority: ["Last"],
        drawGUIOverlay: ["true"],
        uiIconForStackCount: ["1"],
        ingestible: [
          {
            foodType: ["Meal"],
            maxNumToIngestAtOnce: ["1"],
            optimalityOffsetHumanlikes: ["16"],
          },
        ],
        description: [],
      },
      {
        $: {
          Name: "MealBase",
          ParentName: "MealBaseIngredientless",
          Abstract: "True",
        },
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Ingredients" },
                splitTransferableFoodKind: ["true"],
              },
            ],
          },
        ],
        description: [],
      },
      {
        $: { ParentName: "MealBase" },
        defName: ["MealSurvivalPack"],
        label: ["packaged survival meal"],
        description: [],
        graphicData: [
          {
            texPath: ["Things/Item/Meal/SurvivalPack"],
            graphicClass: ["Graphic_MealVariants"],
          },
        ],
        statBases: [
          {
            DeteriorationRate: ["0.25"],
            MarketValue: ["24"],
            Mass: ["0.3"],
            WorkToMake: ["450"],
            Nutrition: ["0.9"],
          },
        ],
        ingestible: [
          {
            preferability: ["MealSimple"],
            optimalityOffsetHumanlikes: ["-5"],
            optimalityOffsetFeedingAnimals: ["-10"],
            ingestEffect: ["EatVegetarian"],
            ingestSound: ["Meal_Eat"],
          },
        ],
        allowedArchonexusCount: ["40"],
      },
      {
        $: { ParentName: "MealBase" },
        defName: ["MealNutrientPaste"],
        label: ["nutrient paste meal"],
        description: [],
        graphicData: [
          {
            texPath: ["Things/Item/Meal/NutrientPaste"],
            graphicClass: ["Graphic_MealVariants"],
          },
        ],
        statBases: [{ MarketValue: ["10"], Nutrition: ["0.9"] }],
        ingestible: [
          {
            preferability: ["MealAwful"],
            ateEvent: ["AteNutrientPaste"],
            ingestEffect: ["EatVegetarian"],
            ingestSound: ["Meal_Eat"],
          },
        ],
        tradeability: ["Buyable"],
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Rottable" },
                daysToRotStart: ["0.75"],
                rotDestroys: ["true"],
              },
            ],
          },
        ],
      },
      {
        $: {
          ParentName: "MealBaseIngredientless",
          Name: "MealCookedIngredientless",
          Abstract: "True",
        },
        tradeability: ["Buyable"],
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Rottable" },
                daysToRotStart: ["4"],
                rotDestroys: ["true"],
              },
            ],
          },
        ],
        description: [],
      },
      {
        $: {
          ParentName: "MealCookedIngredientless",
          Name: "MealCooked",
          Abstract: "True",
        },
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Ingredients" },
                splitTransferableFoodKind: ["true"],
              },
            ],
          },
        ],
        description: [],
      },
      {
        $: { ParentName: "MealCooked" },
        defName: ["MealSimple"],
        label: ["simple meal"],
        description: [],
        graphicData: [
          {
            texPath: ["Things/Item/Meal/Simple"],
            graphicClass: ["Graphic_MealVariants"],
          },
        ],
        statBases: [
          { MarketValue: ["15"], WorkToMake: ["300"], Nutrition: ["0.9"] },
        ],
        ingestible: [
          {
            preferability: ["MealSimple"],
            ingestEffect: ["EatVegetarian"],
            ingestSound: ["Meal_Eat"],
          },
        ],
      },
      {
        $: {
          Name: "MealFineBase",
          ParentName: "MealCookedIngredientless",
          Abstract: "True",
        },
        statBases: [
          { MarketValue: ["20"], WorkToMake: ["450"], Nutrition: ["0.9"] },
        ],
        ingestible: [
          {
            preferability: ["MealFine"],
            tasteThought: ["AteFineMeal"],
            ingestEffect: ["EatVegetarian"],
            ingestSound: ["Meal_Eat"],
          },
        ],
        description: [],
      },
      {
        $: { ParentName: "MealFineBase" },
        defName: ["MealFine"],
        label: ["fine meal"],
        description: [],
        graphicData: [
          {
            texPath: ["Things/Item/Meal/Fine"],
            graphicClass: ["Graphic_MealVariants"],
          },
        ],
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Ingredients" },
                splitTransferableFoodKind: ["true"],
              },
            ],
          },
        ],
      },
      {
        $: { ParentName: "MealFineBase" },
        defName: ["MealFine_Veg"],
        label: ["vegetarian fine meal"],
        description: [],
        possessionCount: ["2"],
        graphicData: [
          {
            texPath: ["Things/Item/Meal/FineVeg"],
            graphicClass: ["Graphic_StackCount"],
          },
        ],
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Ingredients" },
                noIngredientsFoodKind: ["NonMeat"],
              },
            ],
          },
        ],
      },
      {
        $: { ParentName: "MealFineBase" },
        defName: ["MealFine_Meat"],
        label: ["carnivore fine meal"],
        description: [],
        possessionCount: ["2"],
        graphicData: [
          {
            texPath: ["Things/Item/Meal/FineMeat"],
            graphicClass: ["Graphic_StackCount"],
          },
        ],
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Ingredients" },
                noIngredientsFoodKind: ["Meat"],
              },
            ],
          },
        ],
      },
      {
        $: {
          Name: "MealLavishBase",
          ParentName: "MealCookedIngredientless",
          Abstract: "True",
        },
        description: [],
        statBases: [
          { MarketValue: ["40"], WorkToMake: ["800"], Nutrition: ["1"] },
        ],
        ingestible: [
          {
            preferability: ["MealLavish"],
            tasteThought: ["AteLavishMeal"],
            ingestEffect: ["EatVegetarian"],
            ingestSound: ["Meal_Eat"],
          },
        ],
      },
      {
        $: { ParentName: "MealLavishBase" },
        defName: ["MealLavish"],
        label: ["lavish meal"],
        graphicData: [
          {
            texPath: ["Things/Item/Meal/Lavish"],
            graphicClass: ["Graphic_MealVariants"],
          },
        ],
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Ingredients" },
                splitTransferableFoodKind: ["true"],
              },
            ],
          },
        ],
        description: [],
      },
      {
        $: { ParentName: "MealLavishBase" },
        defName: ["MealLavish_Veg"],
        label: ["vegetarian lavish meal"],
        graphicData: [
          {
            texPath: ["Things/Item/Meal/LavishVeg"],
            graphicClass: ["Graphic_StackCount"],
          },
        ],
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Ingredients" },
                noIngredientsFoodKind: ["NonMeat"],
              },
            ],
          },
        ],
        description: [],
      },
      {
        $: { ParentName: "MealLavishBase" },
        defName: ["MealLavish_Meat"],
        label: ["carnivore lavish meal"],
        graphicData: [
          {
            texPath: ["Things/Item/Meal/LavishMeat"],
            graphicClass: ["Graphic_StackCount"],
          },
        ],
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Ingredients" },
                noIngredientsFoodKind: ["Meat"],
              },
            ],
          },
        ],
        description: [],
      },
      {
        $: { ParentName: "OrganicProductBase" },
        defName: ["Kibble"],
        label: ["kibble"],
        description: [],
        thingCategories: [{ li: ["Foods"] }],
        graphicData: [{ texPath: ["Things/Item/Resource/Kibble"] }],
        socialPropernessMatters: ["true"],
        statBases: [
          {
            MarketValue: ["1.1"],
            Mass: ["0.015"],
            Nutrition: ["0.05"],
            FoodPoisonChanceFixedHuman: ["0.02"],
          },
        ],
        ingestible: [
          {
            foodType: ["Kibble"],
            preferability: ["RawBad"],
            tasteThought: ["AteKibble"],
            optimalityOffsetHumanlikes: ["-30"],
            optimalityOffsetFeedingAnimals: ["15"],
            ingestEffect: ["EatVegetarian"],
            ingestSound: ["RawVegetable_Eat"],
          },
        ],
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Ingredients" },
                performMergeCompatibilityChecks: ["false"],
                noIngredientsFoodKind: ["Meat"],
              },
            ],
          },
        ],
        allowedArchonexusCount: ["200"],
      },
      {
        $: { ParentName: "OrganicProductBase" },
        defName: ["Pemmican"],
        label: ["pemmican"],
        description: [],
        thingClass: ["ThingWithComps"],
        thingCategories: [{ li: ["Foods"] }],
        graphicData: [
          {
            texPath: ["Things/Item/Resource/Pemmican"],
            graphicClass: ["Graphic_StackCount"],
          },
        ],
        socialPropernessMatters: ["true"],
        statBases: [
          {
            MarketValue: ["1.4"],
            Mass: ["0.018"],
            Flammability: ["0.6"],
            WorkToMake: ["700"],
            DeteriorationRate: ["2"],
            Nutrition: ["0.05"],
          },
        ],
        ingestible: [
          {
            foodType: ["Meal"],
            preferability: ["MealSimple"],
            ingestEffect: ["EatVegetarian"],
            ingestSound: ["Meal_Eat"],
            optimalityOffsetHumanlikes: ["6"],
          },
        ],
        comps: [
          {
            li: [
              {
                $: { Class: "CompProperties_Rottable" },
                daysToRotStart: ["70"],
                rotDestroys: ["true"],
              },
              {
                $: { Class: "CompProperties_Ingredients" },
                noIngredientsFoodKind: ["Meat"],
              },
              { $: { Class: "CompProperties_FoodPoisonable" } },
            ],
          },
        ],
        allowedArchonexusCount: ["200"],
      },
    ],
  },
};
