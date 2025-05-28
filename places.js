const places = {
  "övergivet_torp": {
    "desc": "Ett litet, dammigt torp. Tiden har stått stilla här.",
    "longDesc": "Du står i ett övergivet torp. Möblerna är täckta av vita lakan och ett tjockt lager damm. Solens strålar kämpar för att tränga igenom de smutsiga fönstren. Det luktar instängt och av gammalt trä. På ett rangligt bord ligger en bok.",
    "ascii": `
      小屋
     /  \\
    /____\\
   |  __  |
   | |  | |
   |_|__|_|
    `,
    "items": ["dagbok", "lykta"],
    "exits": { "ut": "glömda_stigen" }
  },
  "glömda_stigen": {
    "desc": "En knappt synlig stig som slingrar sig in i den täta skogen.",
    "longDesc": "Du befinner dig på en övervuxen och nästan osynlig stig. Gamla, knotiga träd lutar sig över dig som tysta väktare. Luften är fylld av doften av fuktig jord och multnande löv. Det är tyst, förutom det svaga prasslet av löv under dina fötter.",
    "items": [],
    "exits": { "tillbaka": "övergivet_torp", "framåt": "uråldriga_eken" }
  },
  "uråldriga_eken": {
    "desc": "En enorm, uråldrig ek med ett ansikte som tycks vara snidat i barken.",
    "longDesc": "Framför dig reser sig en kolossal ek, dess grenar sträcker sig mot himlen som åldrade armar. Barken är tjock och fårad, och på en sida ser du något som liknar ett ansikte, vittrat av tid och väder. Vid dess fot skymtar något bland rötterna.",
    "ascii": `
      (_)
     / | \\
    /  |  \\
    дърво
   /____\\
    `,
    "items": ["nyckel"],
    "exits": { "västerut": "glömda_stigen", "österut": "vattendragets_källa", "nedåt": "rotkällare" }
  },
  "vattendragets_källa": {
    "desc": "En liten källa där vattnet sipprar fram, men det ser grumligt ut.",
    "longDesc": "Vattnet sipprar fram ur en mossbelupen sten och samlas i en liten pöl. Vattnet är grumligt och ser inte inbjudande ut att dricka. Omgivningen är frodig och grön, men en svag, unken doft ligger i luften.",
    "items": [],
    "exits": { "västerut": "uråldriga_eken", "söderut": "stenringen" }
  },
  "stenringen": {
    "desc": "En cirkel av höga, vittrade stenar, täckta av mossa och lavar.",
    "longDesc": "Du står i mitten av en imponerande stencirkel. Stenarna är resta i en perfekt cirkel och bär spår av uråldriga ristningar, nu nästan utplånade av tidens tand. En känsla av stillhet och mystik vilar över platsen. I mitten finns ett litet stenaltare.",
    "items": [],
    "exits": { "norr": "vattendragets_källa", "österut": "murkna_grottan_ingång" }
  },
  "murkna_grottan_ingång": {
    "desc": "En mörk och fuktig grottöppning i bergväggen.",
    "longDesc": "En mörk öppning i bergväggen leder in i vad som ser ut som en fuktig grotta. Kyla strömmar ut från mörkret och en doft av våt sten och jord kittlar dina näsborrar. Det är omöjligt att se långt in utan ljus.",
    "items": [],
    "exits": { "västerut": "stenringen", "in": "murkna_grottan_första_rummet" }
  },
  "murkna_grottan_första_rummet": {
    "desc": "Grottans första rum. Det är becksvart här inne.",
    "longDesc": "Du befinner dig i grottans första kammare. Mörkret är kompakt och det enda du hör är ljudet av droppande vatten. Utan en ljuskälla är det svårt att urskilja några detaljer.",
    "conditions": ["not_has_item_state:lykta:Tänd"], // Exempel på hur man kan försvåra
    "items": ["mossklump"],
    "exits": { "ut": "murkna_grottan_ingång", "djupare": "kristallgrottan" }
  },
  "kristallgrottan": {
    "desc": "En grotta vars väggar skimrar av otaliga kristaller.",
    "longDesc": "Ljuset från din lykta (eller den glimmande mossan) reflekteras i tusentals kristaller som täcker väggar och tak. Grottan gnistrar som en stjärnhimmel. Det är vackert, men gångarna är smala och förrädiska.",
    "items": ["kristall"],
    "exits": { "tillbaka": "murkna_grottan_första_rummet", "ner": "underjordisk_sjö_strand" }
  },
  "underjordisk_sjö_strand": {
    "desc": "Stranden till en stor, stilla underjordisk sjö.",
    "longDesc": "Du står vid kanten av en stor, mörk och fullständigt stilla underjordisk sjö. Vattnet är svart och djupt. Det finns inga synliga tecken på liv. En lätt bris drar genom grottan och får vattenytan att krusa sig lätt.",
    "items": ["drivved"], // Kan kombineras med rep
    "exits": { "upp": "kristallgrottan", "över_sjön": "glömda_altarets_ö" } // "över_sjön" kräver flotte
  },
   "glömda_altarets_ö": {
    "desc": "En liten ö mitt i den underjordiska sjön med ett förfallet altare.",
    "longDesc": "Mitt på den underjordiska sjön ligger en liten, dyster ö. Här står ett gammalt stenaltare, täckt av alger och fukt. Det verkar som om något saknas på altarets yta.",
    "items": ["runstenbit"],
    "exits": { "tillbaka_över_sjön": "underjordisk_sjö_strand" }
  },
  "rotkällare": {
    "desc": "En trång och jordig rotkällare under den uråldriga eken.",
    "longDesc": "Du har klättrat ner i en trång och mörk rotkällare under den gamla ekens rötter. Det luktar starkt av jord och fukt. Rötterna slingrar sig längs väggarna som tjocka ormar. Det är svårt att röra sig här nere.",
    "items": ["trälåda"], // Behöver uråldrig_nyckel
    "exits": { "upp": "uråldriga_eken", "gång": "viskande_gångarna_ingång" }
  },
  "viskande_gångarna_ingång": {
    "desc": "Ingången till ett nätverk av smala, slingrande gångar.",
    "longDesc": "Från rotkällaren leder en smal passage in i ett mörkt system av naturliga gångar. En svag viskning tycks följa med vinddraget härifrån, men det är omöjligt att urskilja några ord.",
    "items": [],
    "exits": { "tillbaka": "rotkällare", "framåt": "viskande_gångarna_korsväg" }
  },
   "viskande_gångarna_korsväg": {
    "desc": "En korsväg i de viskande gångarna. Viskningarna är starkare här.",
    "longDesc": "Gången delar sig här. Viskningarna är tydligare nu, men fortfarande obegripliga, som om vinden själv försöker berätta något. Det är lätt att gå vilse.",
    "items": [],
    "exits": { "norr": "svampdungen", "söder": "maskens_håla_mynning", "väster": "viskande_gångarna_ingång"}
  },
  "svampdungen": {
    "desc": "En dunge fylld med självlysande svampar i olika färger.",
    "longDesc": "Grottan öppnar sig till en större sal där marken är täckt av stora, självlysande svampar. Deras mjuka sken i blått, grönt och violett lyser upp rummet och skapar ett drömskt landskap. Vissa svampar pulserar med ett eget ljus.",
    "items": ["sömnsvamp", "styrkesvamp"],
    "exits": { "söder": "viskande_gångarna_korsväg" }
  },
  "maskens_håla_mynning": {
    "desc": "Mynningen till en extremt trång passage, som en jätteliks mask grävt.",
    "longDesc": "Här slutar gången abrupt vid ett trångt, runt hål i väggen. Det ser ut som om en enorm mask har borrat sig igenom berget. Det är osäkert om du kan ta dig igenom.",
    "items": [],
    "exits": { "norr": "viskande_gångarna_korsväg", "kryp_in": "maskens_håla_inre" } // Kräver kanske att man är "liten" eller har tagit bort något
  },
  "maskens_håla_inre": {
    "desc": "Du är inne i den trånga, jordiga tunneln.",
    "longDesc": "Du kryper genom den trånga, mörka tunneln. Det luktar jord och instängdhet. Efter en stund ser du ett svagt ljus längre fram.",
    "items": [],
    "exits": { "kryp_ut": "maskens_håla_mynning", "mot_ljuset": "biblioteket_av_rötter" }
  },
  "biblioteket_av_rötter": {
    "desc": "Ett stort underjordiskt utrymme där trädrötter bildar komplexa mönster på väggarna.",
    "longDesc": "Tunneln mynnar ut i en enorm underjordisk grotta. Väggarna är täckta av ett intrikat nätverk av massiva trädrötter som ser ut att bilda uråldriga skrifter eller kartor. En känsla av djup visdom genomsyrar platsen.",
    "ascii": `
      // \\
     ROOTS
    //   \\
    `,
    "items": ["runstenbitett"],
    "exits": { "tillbaka": "maskens_håla_inre", "uppåt_via_rötter": "den_tysta_gläntan" }
  },
  "klippstigen": {
    "desc": "En smal stig som klamrar sig fast vid en brant klippvägg.",
    "longDesc": "Du balanserar på en smal klippstig. Till ena sidan har du den kalla stenväggen, till den andra ett svindlande stup. Vinden viner och försöker slita tag i dig. Ett felsteg här kan vara ödesdigert.",
    "items": ["örnbo_synligt_ovanför"], // Kan vara en observation, inte ett item
    "exits": { "nedåt": "uråldriga_eken", "uppåt": "örnens_näste_kant" } // "nedåt" kan vara farligt utan rep
  },
  "örnens_näste_kant": {
    "desc": "Kanten av ett stort örnnäste, högt upp på klippan.",
    "longDesc": "Du har nått kanten av ett gigantiskt örnnäste, byggt av tjocka grenar. Det är tomt för tillfället, men du ser något som glimmar bland kvistarna i mitten av boet.",
    "items": [], // själva föremålet är i nästet
    "exits": { "nedåt_stigen": "klippstigen", "klättra_ner_i_nästet": "örnens_näste_centrum" }
  },
  "örnens_näste_centrum": {
    "desc": "Mitten av det stora örnnästet.",
    "longDesc": "Du befinner dig i mitten av det stora, rufsiga örnnästet. Det luktar fågel och torra kvistar. Här, bland dun och små benrester, ligger en vacker fjäder och en liten, sliten läderpung.",
    "items": ["örnfjäder", "linsbit"],
    "exits": { "klättra_upp_ur_nästet": "örnens_näste_kant" }
  },
  "vindpinade_toppen": {
    "desc": "Bergstoppen. Utsikten är milsvid, men vinden är stark.",
    "longDesc": "Du står på bergets högsta topp. Vinden sliter i dina kläder och utsikten är andlös. Du kan se skogen breda ut sig under dig som en grön matta, och i fjärran skymtar ruiner av något gammalt.",
    "items": [],
    "exits": { "nedåt_stigen": "örnens_näste_kant", "mot_ruinerna": "gamla_observatoriets_fot" } // Lång väg
  },
  "gamla_observatoriets_fot": {
    "desc": "Vid foten av ett kollapsat, gammalt observatorium.",
    "longDesc": "Du har nått foten av ett gammalt, förfallet torn som en gång måste ha varit ett observatorium. Stora delar av muren har rasat, men en trasig spiraltrappa leder fortfarande uppåt.",
    "items": [],
    "exits": { "tillbaka_mot_toppen": "vindpinade_toppen", "uppför_trappan": "gamla_observatoriet_ruin" }
  },
  "gamla_observatoriet_ruin": {
    "desc": "Inne i det raserade observatoriet. Taket är borta.",
    "longDesc": "Du står inne i det som en gång var observatoriets huvudkupol. Taket har rasat in och stjärnorna lyser klart ovanför dig. En stor, rostig anordning i mitten ser ut att ha hållit en stor lins en gång i tiden. På väggen finns en urblekt stjärnkarta.",
    "items": ["linsbitett"], // Behöver kombineras
    "exits": { "nedför_trappan": "gamla_observatoriets_fot", "studera_stjärnkartan": "stjärnkartans_rum_ingång" } // Kräver komplett stjärnlins
  },
  "den_tysta_gläntan": {
    "desc": "En glänta där en onaturlig tystnad råder.",
    "longDesc": "Du kliver ut i en glänta där tystnaden är nästan total. Inga fåglar sjunger, inga insekter surrar. Träden runt gläntan ser sjuka och gråaktiga ut. En känsla av olust kryper över dig.",
    "items": [],
    "exits": { "nedåt_genom_rötter": "biblioteket_av_rötter", "in_i_skogen": "förvridna_trädens_stig" }
  },
  "förvridna_trädens_stig": {
    "desc": "En stig kantad av förvridna, taggiga träd.",
    "longDesc": "Stigen leder dig djupare in i en del av skogen där träden är förvridna och taggiga. Grenarna sträcker sig som klor och luften är tung. Det känns som om skogen själv är sjuk här.",
    "items": ["bär"], // Kanske giftiga
    "exits": { "tillbaka_gläntan": "den_tysta_gläntan", "genom_snåren": "giftträskets_kant" } // Kräver kanske yxa
  },
  "giftträskets_kant": {
    "desc": "Kanten av ett träsk med bubblande, giftiggrönt vatten.",
    "longDesc": "Du står vid randen av ett stort träsk. Vattnet är tjockt, grönt och bubblar sakta. En stickande, kemisk lukt stiger upp och får dina ögon att tåras. Det ser inte ut att finnas någon säker väg över.",
    "items": ["andningsskydd"],
    "exits": { "tillbaka_stigen": "förvridna_trädens_stig", "försök_korsa": "giftträsket_mitt" } // Kräver skydd eller rening
  },
  "giftträsket_mitt": {
    "desc": "Du är mitt ute i det farliga giftträsket.",
    "longDesc": "Med hjälp av [något skydd/renad stig] har du tagit dig ut till en liten, skakig tuva mitt i giftträsket. Ångorna är fortfarande starka. I fjärran ser du något som liknar en skadad jätte.",
    "items": [],
    "exits": { "tillbaka_kanten": "giftträskets_kant", "mot_jätten": "den_sårade_väktarens_glänta" }
  },
  "den_sårade_väktarens_glänta": {
    "desc": "En glänta där ett enormt, uråldrigt träd sakta dör.",
    "longDesc": "Du når en glänta där ett gigantiskt, uråldrigt träd står. Det är tydligt att trädet lider – barken är sprucken, grenarna hänger slappt och en mörk sörja sipprar från dess stam. Det är Skogens Väktare, och den är döende.",
    "items": ["livsknopp"], // Om man lyckas hjälpa det lite
    "exits": { "tillbaka_träsket": "giftträsket_mitt", "hemlig_gång": "heliga_lundens_port" } // Öppnas om väktaren hjälps
  },
  "stjärnkartans_rum_ingång": {
    "desc": "En dold dörr har öppnats bakom stjärnkartan.",
    "longDesc": "Efter att ha placerat stjärnlinsen (eller löst pusslet) på observatoriets stjärnkarta, glider en del av väggen undan och avslöjar en mörk passage.",
    "items": [],
    "exits": { "ut_observatoriet": "gamla_observatoriet_ruin", "in_i_passagen": "stjärnkartans_rum_inre" }
  },
  "stjärnkartans_rum_inre": {
    "desc": "Ett runt rum med en projektion av stjärnhimlen i taket.",
    "longDesc": "Du är i ett cirkulärt rum. I taket projiceras en komplex och rörlig stjärnhimmel. I mitten av rummet finns en piedestal med fördjupningar som liknar stjärnkonstellationer.",
    "items": ["runstenbittva"],
    "exits": { "ut_igen": "stjärnkartans_rum_ingång", "rör_piedestalen": "spegelportalens_kammare" } // Kräver att man placerar runstenar?
  },
  "spegelportalens_kammare": {
    "desc": "En kammare med en stor, skimrande spegel.",
    "longDesc": "Rummet domineras av en stor, oval spegel som står fritt i mitten. Ytan är inte reflekterande som en vanlig spegel, utan skimrar och rör sig som flytande silver. Den utstrålar en svag energi.",
    "items": [],
    "exits": { "tillbaka": "stjärnkartans_rum_inre", "gå_igenom_portalen": "heliga_lundens_port" } // Aktiveras på något sätt
  },
  "heliga_lundens_port": {
    "desc": "En vacker port gjord av levande trä och blommor, som leder till den heliga lunden.",
    "longDesc": "Oavsett om du kom via väktaren eller spegelportalen, står du nu inför en magnifik port. Den är formad av sammanflätade grenar av levande träd, prydd med blommor som lyser med ett mjukt inre ljus. Detta måste vara ingången till den heliga lunden.",
    "items": [],
    "exits": { "tillbaka_stjärnrummet": "spegelportalens_kammare", "tillbaka_väktaren": "den_sårade_väktarens_glänta", "gå_igenom_porten": "heliga_lunden" } // Kräver kanske "renat hjärta" eller ett visst föremål.
  },
  "heliga_lunden": {
    "desc": "En fridfull, orörd lund där luften vibrerar av magi.",
    "longDesc": "Du kliver in i en lund av ojämförlig skönhet. Luften är ren och fylld av en söt doft. Solstrålar silar ner genom lövverket och skapar ett gyllene ljus. Gamla träd med silverglänsande bark står i en cirkel. I mitten finns en mossbelagd stig.",
    "items": ["livsfrö"],
    "exits": { "ut_porten": "heliga_lundens_port", "följ_stigen": "prövningens_stig" }
  },
  "prövningens_stig": {
    "desc": "En stig som testar din visdom och ditt mod.",
    "longDesc": "Stigen från den heliga lunden leder dig till en serie av små utmaningar. En gammal ande eller inskriptioner kan ge dig gåtor att lösa, eller så krävs specifika föremål för att passera.",
    "items": [], // Belöning kan vara passage
    "exits": { "tillbaka_lunden": "heliga_lunden", "framåt_efter_prövning": "inre_helgedomen_förgård" }
  },
  "inre_helgedomen_förgård": {
    "desc": "Förgården till den innersta helgedomen. En uråldrig dörr blockerar vägen.",
    "longDesc": "Du når en öppen plats framför en massiv stendörr, täckt av invecklade ristningar. Dörren är förseglad med uråldrig magi. Detta är porten till Skogens Hjärta.",
    "items": [],
    "exits": { "tillbaka_stigen": "prövningens_stig", "öppna_dörren": "skogens_hjärta_kammare" } // Kräver alla runstenar eller ett speciellt föremål/ritual
  },
  "skogens_hjärta_kammare": {
    "desc": "Kammaren där Skogens Hjärta finns. Det pulserar med ett svagt, sjukligt ljus.",
    "longDesc": "Dörren glider upp och avslöjar en enorm grottsal. I mitten svävar ett gigantiskt, pulserande hjärta av ljus och energi – Skogens Hjärta. Men dess ljus är svagt och fläckat av mörka strimmor av korruption. Runtomkring ser du vissnande växtlighet och känner en tryckande närvaro.",
    "ascii": `
      .-"""-.
     /       \\
    |  SKOGS  |
    |  HJÄRTA |
     \\       /
      '-...-'
    `,
    "items": [], // Målet är att interagera här
    "exits": {} // Ingen väg tillbaka tills uppdraget är slutfört
  }
}