const actions = {
  "*": [ // Generella handlingar
    {
      "pattern": "(tänd|starta|använd) lykta",
      "conditions": ["has:lykta", "item:lykta:Släckt", "item_gt:lykta:fuel:0"],
      "response": "Du tänder den rostiga lyktan. Ett varmt sken sprider sig och jagar bort de värsta skuggorna.",
      "state_change": {"item":"lykta","state":"Tänd"}
    },
    {
      "pattern": "(tänd|starta|använd) lykta",
      "conditions": ["has:lykta", "item:lykta:Släckt", "item_eq:lykta:fuel:0"],
      "response": "Lyktan är tom på fotogen. Du behöver fylla på den.",
    },
    {
      "pattern": "(släck|stäng av) lykta",
      "conditions": ["has:lykta", "item:lykta:Tänd"],
      "response": "Du släcker lyktan. Mörkret tätnar omkring dig.",
      "state_change": {"item":"lykta","state":"Släckt"}
    },
    {
      "pattern": "(fyll|fylla på) lykta med fotogen",
      "conditions": ["has:lykta", "has:fotogen"],
      "response": "Du fyller försiktigt på fotogen i lyktan från flaskan. Nu bör den lysa ett bra tag.",
      "state_change": {"item":"lykta","key":"fuel", "value": 100}, // Sätter bränsle till max
      "consume_item": "fotogen" // Förbrukar fotogenflaskan (eller minskar dess innehåll)
    },
    {
      "pattern": "(läs|titta i|undersök) dagbok",
      "conditions": ["has:dagbok"],
      "response": "Du läser i den gamla dagboken. Din förfader skriver om 'Skogens Hjärta', en plats med uråldrig kraft, och ett 'smygande mörker' som hotar den. En grov karta visar vägen från torpet till en stor ek.",
      // Kan avslöja en ledtråd eller ett nytt mål.
    },
    {
        "pattern": "(kombinera|sätt ihop|laga) stjärnlins",
        "conditions": ["has:linsbit", "has:linsbitett"],
        "response": "Du fogar försiktigt ihop de två linsbitarna. De passar perfekt och bildar en komplett stjärnlins!",
        "remove_items": ["linsbit", "linsbitett"],
        "add_item": "stjärnlins"
    },
    {
        "pattern": "(kombinera|sätt ihop) runstenar",
        "conditions": ["has:runstenbit", "has:runstenbitett", "has:runstenbittva"],
        "response": "Du placerar de tre runstensbitarna bredvid varandra. De dras magiskt samman och bildar en enda sten med en lysande symbol!",
        "remove_items": ["runstenbit", "runstenbitett", "runstenbittva"],
        "add_item": "runsten"
    },
    {
      "pattern": "(drick|använd) stärkande svamp",
      "conditions": ["has:styrkesvamp"],
      "response": "Du äter den stärkande svampen. En varm känsla sprider sig i kroppen och du känner dig starkare!",
      "consume_item": "styrkesvamp",
      "set_player_state": {"key": "styrka", "value": "förhöjd", "duration": 5} // Tillfällig effekt i X antal "turer" eller rumbyten
    }
    // Fler generella handlingar för att använda/kombinera föremål kan läggas till här.
  ],
  "uråldriga_eken": [
    {
      "pattern": "(ta|plocka upp|dra loss) nyckel",
      "conditions": ["room_has:nyckel"],
      "response": "Du drar loss en tung, uråldrig nyckel som satt fastkilad bland ekens rötter.",
      "pickup_item": "nyckel",
      "remove_from_room": "nyckel"
    },
    {
        "pattern": "(klättra|gå) nedåt",
        "response": "Du hittar en öppning bland rötterna och klättrar ner i mörkret.",
        "go": "rotkällare"
    }
  ],
  "vattendragets_källa": [
    {
      "pattern": "(rena|använd kristall på) vatten",
      "conditions": ["has:kristall"],
      "response": "Du doppar den renande kristallen i det grumliga vattnet. Långsamt klarnar vattnet och börjar skimra svagt. Du fyller en flaska med det nu heliga vattnet.",
      "add_item": "källvatten",
      "state_change": {"room_item":"vattendragets_källa", "property":"description_suffix", "value":" Vattnet är nu kristallklart och skimrande."} // Ändrar beskrivningen av rummet/källan
    },
    {
        "pattern": "(drick|smaka på) vatten",
        "conditions": ["not_has_flag:vatten_renat_vid_källa"], // Antag att flaggan sätts när man renar
        "response": "Du smakar försiktigt på det grumliga vattnet. Det smakar unket och du känner dig lite illamående. Bäst att låta bli."
    },
    {
        "pattern": "(drick|smaka på) vatten",
        "conditions": ["has_flag:vatten_renat_vid_källa"],
        "response": "Du dricker av det klara, rena vattnet. Det är uppfriskande och du känner dig stärkt."
    }
  ],
  "stenringen": [
    {
      "pattern": "(placera|använd) runstenar (på|vid) altare",
      "conditions": ["has:runsten", "at_location:stenringen"], // `at_location` är en hypotetisk condition
      "response": "Du placerar den samlade runstenen på det lilla stenaltaret. Symbolen på stenen börjar lysa starkare, och du hör ett dovt muller från öster, som om en passage har öppnats.",
      "state_change": {"world_event":"stenring_aktiverad", "value":true} // Kan låsa upp en ny väg eller ändra något i "murkna_grottan_ingång"
    }
  ],
  "murkna_grottan_första_rummet": [
    {
      "pattern": "(ta|plocka) mossa",
      "conditions": ["room_has:mossklump", "item:lykta:Släckt"], // Kanske man bara ser den om lyktan är släckt först?
      "response": "Du tar en klump av den svagt lysande mossan.",
      "pickup_item": "mossklump",
      "remove_from_room": "mossklump"
    },
    {
      "pattern": "(tänd|använd) mossa",
      "conditions": ["has:mossklump"],
      "response": "Den glimmande mossan ger ifrån sig tillräckligt med ljus för att du ska kunna se dig omkring i det närmaste.",
      // Sätt en temporär ljus-flagga eller liknande.
    }
  ],
  "underjordisk_sjö_strand": [
    {
      "pattern": "(bygg|konstruera|gör) flotte",
      "conditions": ["has:drivved", "has:rep"],
      "response": "Du använder repet för att binda ihop drivveden till en stadig, om än enkel, flotte. Den ser ut att kunna bära dig över sjön.",
      "remove_items": ["drivved", "rep"],
      "add_item": "flotte", // Flotten är kanske inte portabel, utan blir en del av rummet
      "state_change": {"room":"underjordisk_sjö_strand", "feature":"flotte_byggd", "value":true}, // Gör att "över_sjön" blir en möjlig exit
      "reveals_exit": {"direction":"över_sjön", "destination":"glömda_altarets_ö"}
    },
    {
      "pattern": "(använd|ta) flotte",
      "conditions": ["room_feature:flotte_byggd"],
      "response": "Du kliver på flotten och puttar ut den på den mörka, stilla sjön.",
      "go": "glömda_altarets_ö"
    }
  ],
  "rotkällare": [
    {
        "pattern": "(öppna|lås upp) (trälåda|låda) med nyckel",
        "conditions": ["has:nyckel", "room_has_item_state:trälåda:stängd"], // Antag att lådan har ett state
        "response": "Den uråldriga nyckeln passar perfekt i låset! Du vrider om och öppnar lådan. Inuti hittar du en flaska fotogen.",
        "pickup_item": "fotogen", // Tar automatiskt upp innehållet
        "state_change": {"item":"trälåda", "state":"öppen"},
        "remove_from_room": "trälåda" // Kanske lådan försvinner eller så blir den "trälåda_öppen"
    }
  ],
  "gamla_observatoriet_ruin": [
    {
        "pattern": "(använd|placera) stjärnlins (i|på) (anordning|stjärnkarta|hållare)",
        "conditions": ["has:stjärnlins", "at_location:gamla_observatoriet_ruin"],
        "response": "Du placerar den kompletta stjärnlinsen i den rostiga hållaren på stjärnkartan. Linsen fokuserar det svaga stjärnljuset och projicerar en tidigare osynlig symbol på väggen bredvid kartan. En del av väggen glider undan och avslöjar en mörk passage!",
        "reveals_exit": {"direction":"studera_stjärnkartan", "destination":"stjärnkartans_rum_ingång"}, // Detta är lite fel, ska nog vara en direkt 'go' eller en flagga som gör att 'studera_stjärnkartan' leder rätt.
        "state_change": {"world_event":"observatorie_lins_aktiverad", "value":true}
    }
  ],
  "förvridna_trädens_stig": [
    {
      "pattern": "(hugg|rensa|använd yxa på) (snår|träd|grenar)",
      "conditions": ["has:yxa"],
      "response": "Med några välriktade hugg med yxan lyckas du rensa en väg genom de täta, taggiga snåren.",
      "state_change": {"room":"förvridna_trädens_stig", "feature":"snår_rensat", "value":true},
      "reveals_exit": {"direction":"genom_snåren", "destination":"giftträskets_kant"}
    }
  ],
  "giftträskets_kant": [
    {
        "pattern": "(använd|kasta) (renande kristall|kristall) (i|på) träsket",
        "conditions": ["has:kristall"],
        "response": "Du kastar den renande kristallen i det giftiga vattnet. Där den landar börjar vattnet klarna och en smal, säker stig av fastare mark framträder genom träsket!",
        "consume_item": "kristall",
        "state_change": {"room":"giftträskets_kant", "feature":"stig_renad", "value":true},
        "reveals_exit": {"direction":"försök_korsa", "destination":"giftträsket_mitt"}
    }
  ],
  "den_sårade_väktarens_glänta": [
    {
        "pattern": "(hjälp|hela|ge|använd) (livets frö|frö|knopp|heligt vatten) (till|på) (väktare|träd)",
        "conditions": ["has:livsfrö OR has:livsknopp OR has:källvatten", "at_location:den_sårade_väktarens_glänta", "not_has_flag:väktare_hjälpt"],
        "response": "Du närmar dig försiktigt det lidande trädet och [beroende på föremål: placerar fröet vid dess rötter / trycker knoppen mot barken / häller det heliga vattnet över såren]. Trädet skälver till och ett svagt, gyllene ljus sprider sig från kontaktpunkten. En del av mörkret tycks dra sig tillbaka. Väktaren verkar tacksam. En tidigare dold gång öppnar sig bakom trädet.",
        "consume_item_if_present": ["livsfrö", "livsknopp", "källvatten"], // Förbruka det som användes
        "set_flag": "väktare_hjälpt",
        "reveals_exit": {"direction":"hemlig_gång", "destination":"heliga_lundens_port"}
    }
  ],
  "stjärnkartans_rum_inre": [
    {
        "pattern": "(placera|använd|sätt) (runsten|samlad runsten) (på|i|vid) piedestal",
        "conditions": ["has:runsten", "at_location:stjärnkartans_rum_inre"],
        "response": "Du placerar den samlade runstenen i en fördjupning på piedestalen. Stjärnprojektionen i taket börjar snurra snabbare och en skimrande portal materialiseras i rummets mitt!",
        "consume_item": "runsten", // Kanske? Eller så behövs den senare.
        "state_change": {"room":"stjärnkartans_rum_inre", "feature":"portal_aktiverad", "value":true},
        "reveals_exit": {"direction":"rör_piedestalen", "destination":"spegelportalens_kammare"} // Byt namn på exit eller gör det tydligare
    }
  ],
  "spegelportalens_kammare": [
    {
        "pattern": "(gå igenom|använd|kliv in i) portal",
        "conditions": ["room_feature_true:stjärnkartans_rum_inre:portal_aktiverad"], // Kollar om portalen är aktiv från förra rummet (eller om det finns en portal här)
        "response": "Du tar ett djupt andetag och kliver igenom den skimrande ytan. En känsla av desorientering sköljer över dig innan du står stadigt igen.",
        "go": "heliga_lundens_port"
    }
  ],
  "heliga_lundens_port": [
    {
        "pattern": "(gå igenom|passera) porten",
        // Kan kräva en condition, t.ex. att man har hjälpt väktaren eller har ett "rent hjärta" (svårt att mäta)
        // eller att man har "livets_frö" som ett tecken på god avsikt.
        "conditions": ["has:livsfrö"],
        "response": "Du håller fram livets frö och portens blommor tycks nicka instämmande. Grenarna drar sig sakta åt sidan och du kan passera.",
        "go": "heliga_lunden"
    }
  ],
  "prövningens_stig": [
    {
        "pattern": "svara (på) gåta", // Generisk, behöver specifik gåta och svar
        "response": "Du måste specificera gåtan och ditt svar.",
    },
    // Exempel på en prövning:
    {
        "pattern": "säg lösenordet (till|för) anden", // Antag att det finns en ande här.
        "conditions": ["player_knows_lösenord:skogsvaktarens_ära"], // Spelaren måste ha lärt sig lösenordet
        "response": "Anden nickar. 'Du är värdig.' Stigen framåt klarnar.",
        "state_change": {"room":"prövningens_stig", "feature":"prövning1_klarad", "value":true},
        "reveals_exit": {"direction":"framåt_efter_prövning", "destination":"inre_helgedomen_förgård"}
    }
  ],
  "inre_helgedomen_förgård": [
    {
        "pattern": "(öppna|använd runsten på) dörr(en)?",
        "conditions": ["has:runsten"], // Kanske runstenen inte förbrukades tidigare, eller så behövs en ny nyckel.
        "response": "Du håller fram den samlade runstenen mot den massiva dörren. Symbolen på stenen börjar pulsera i takt med ristningarna på dörren. Med ett dånande ljud glider stendörren upp!",
        "consume_item": "runsten",
        "go": "skogens_hjärta_kammare"
    }
  ],
  "skogens_hjärta_kammare": [
    {
        "pattern": "(använd|placera|plantera) livets frö (vid|i|på) (hjärtat|skogens hjärta)",
        "conditions": ["has:livsfrö", "at_location:skogens_hjärta_kammare"],
        "response": "Du närmar dig det lidande Hjärtat och planterar försiktigt Livets Frö vid dess bas. Fröet börjar omedelbart spira och sända ut ett rent, helande ljus! Ljuset sprider sig genom Hjärtat, tränger undan mörkret och korruptionen. En våg av livsenergi sköljer genom kammaren och du känner hur skogen utanför drar en lättnadens suck. Hjärtat pulserar nu med ett starkt, friskt sken. Du har lyckats!",
        "consume_item": "livsfrö",
        "state_change": {"world_event":"skogens_hjärta_renat", "value":true},
        "game_ending": {
            "title": "Skogens Beskyddare",
            "message": "Med Skogens Hjärta återställt till sin fulla prakt, återvänder livet och harmonin till de djupa skogarna. Viskningarna i träden sjunger nu ditt lov, och du kommer för alltid att minnas som den som räddade den uråldriga skogen. En känsla av djup upprymdhet och frid fyller dig."
        }
    }
  ]
}