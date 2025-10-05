import React from 'react'
import { View, Text, FlatList, Pressable, ScrollView, StyleSheet, Alert, Linking, Dimensions, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import BottomSheet from '../ui/BottomSheet'
import { GlideCard, GlidePlan, SheetState, FilterType } from '../types/glideguard'
import { utilPercent, targetPercent, gapToTarget, actionQueue, selectTopAction, sortCards, getOverTargetPercent, getCardStatus } from '../utils/glideMath'
import { BANK_DEEPLINKS, BANK_STORES } from '../constants/deeplinks'
import { LineChart } from 'react-native-chart-kit'

const W = Dimensions.get("window").width;
const chartW = W - 32;
const chartH = 110;

const MOCK_PLAN: GlidePlan = {
  asOfISO: new Date().toISOString(),
  safeToSpend: 312, 
  setAside: 146, 
  cushion: 100, 
  targetUtilDefault: 0.10,
  cards: [
    { 
      id: "td-visa", 
      issuer: "td", 
      brand: "TD Visa", 
      last4: "1142", 
      limit: 2000, 
      posted: 480, 
      target: 0.10, 
      pay: 280, 
      safeBy: "Tue 5:00 pm", 
      closes: "Thu", 
      apr: 19.99, 
      pLag: "~2 biz days", 
      topAction: true, 
      nextCloseTs: new Date(Date.now() + 2 * 864e5).toISOString() 
    },
    { 
      id: "tangerine-mc", 
      issuer: "tangerine", 
      brand: "Tangerine MC", 
      last4: "7731", 
      limit: 3500, 
      posted: 640, 
      target: 0.30, 
      pay: 0, 
      safeBy: "—", 
      closes: "Mon", 
      apr: 19.95, 
      pLag: "~1–2 biz days", 
      nextCloseTs: new Date(Date.now() + 4 * 864e5).toISOString() 
    },
    { 
      id: "amex-blue", 
      issuer: "amex", 
      brand: "Amex Blue", 
      last4: "9024", 
      limit: 1000, 
      posted: 260, 
      target: 0.10, 
      pay: 170, 
      safeBy: "Wed 3:00 pm", 
      closes: "Fri", 
      apr: 20.99, 
      pLag: "~1 biz day", 
      nextCloseTs: new Date(Date.now() + 3 * 864e5).toISOString() 
    },
    { 
      id: "scotia-visa", 
      issuer: "scotia", 
      brand: "Scotia Visa", 
      last4: "3321", 
      limit: 4500, 
      posted: 2100, 
      target: 0.30, 
      pay: 750, 
      safeBy: "Thu 4:00 pm", 
      closes: "Mon", 
      apr: 20.99, 
      pLag: "~2 biz days", 
      nextCloseTs: new Date(Date.now() + 5 * 864e5).toISOString() 
    },
    { 
      id: "bmo-mc", 
      issuer: "bmo", 
      brand: "BMO MC", 
      last4: "1188", 
      limit: 3000, 
      posted: 200, 
      target: 0.10, 
      pay: 0, 
      safeBy: "—", 
      closes: "Wed", 
      apr: 19.99, 
      pLag: "~1–2 biz days", 
      nextCloseTs: new Date(Date.now() + 6 * 864e5).toISOString() 
    },
    { 
      id: "cibc-visa", 
      issuer: "cibc", 
      brand: "CIBC Visa", 
      last4: "5570", 
      limit: 1200, 
      posted: 960, 
      target: 0.10, 
      pay: 840, 
      safeBy: "Tue 1:00 pm", 
      closes: "Thu", 
      apr: 22.99, 
      pLag: "~2 biz days", 
      nextCloseTs: new Date(Date.now() + 2 * 864e5).toISOString() 
    },
  ],
};

export default function GlideGuardScreen() {
  const [plan] = React.useState<GlidePlan>(MOCK_PLAN);
  const [sheet, setSheet] = React.useState<SheetState>(null);

  // Derived
  const top = selectTopAction(plan.cards);
  const queue = actionQueue(plan.cards);

  // ---- Deep links with graceful fallback ----
  async function openBankAppOrCopy(card: GlideCard) {
    const schemes = (card.issuer && BANK_DEEPLINKS[card.issuer]) || [];
    for (const url of schemes) {
      // try open known scheme
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) { await Linking.openURL(url); return; }
      } catch {}
    }
    // fallback: copy
    Alert.alert("Copy amount", `Copy $${card.pay} and pay via your bank app/payee.`);
    // (Optional) Offer store link:
    // if (card.issuer && BANK_STORES[card.issuer]) Linking.openURL(BANK_STORES[card.issuer]);
  }

  // ---- Sort & Filter defaults for All Cards sheet ----
  const [filter, _setFilter] = React.useState<FilterType>("needs");
  const sorted = React.useMemo(() => {
    const now = new Date();
    const base = [...plan.cards].sort((a,b) => sortCards(a,b,now));
    if (filter === "needs") return base.filter(c => c.pay > 0 && utilPercent(c) > targetPercent(c));
    if (filter === "ok")    return base.filter(c => !(c.pay > 0 && utilPercent(c) > targetPercent(c)));
    return base;
  }, [plan.cards, filter]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b0b" />
      <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header / KPI */}
        <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Ionicons name="shield-checkmark" size={18} color="#7AF0C7" />
            <Text style={styles.caption}>Glide Guard</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => setSheet({ type: "sort" })} style={styles.pill}>
              <Ionicons name="funnel" size={14} color="#fff" /><Text style={styles.pillTxt}>Sort</Text>
            </Pressable>
            <Pressable onPress={() => setSheet({ type: "all", payload: plan.cards })} style={styles.pill}>
              <Ionicons name="layers" size={14} color="#fff" /><Text style={styles.pillTxt}>Sheet</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.h1}>Your weekly card plan</Text>
        <Text style={styles.sub}>Zero panic. One step a week. We protect cushion and set-asides first.</Text>

        <View style={styles.kpiRow}>
          <Kpi label="Safe-to-Spend" value={`$${plan.safeToSpend}`} icon="wallet" sub="after PADs & set-asides" />
          <Kpi label="Set Aside" value={`$${plan.setAside}`} icon="cash" sub="Tax • CPP • HST" />
          <Kpi label="Cushion" value={`$${plan.cushion}`} icon="shield-checkmark" sub="Protected" />
        </View>
      </View>

      {/* Top Action */}
      {top && (
        <TopAction
          card={top}
          onPay={(c) => setSheet({ type: "pay", payload: c })}
          onWhy={(c) => setSheet({ type: "why", payload: c })}
          onSnooze={(c) => setSheet({ type: "snooze", payload: c })}
        />
      )}

      {/* Action Queue */}
      {queue.length > 0 && (
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}><Ionicons name="list-circle" size={16} color="#fff" /> Action queue</Text>
            <Pressable onPress={() => setSheet({ type: "all", payload: plan.cards })}><Text style={styles.link}>View all</Text></Pressable>
          </View>
          {queue.map((c) => (
            <CompactRow key={c.id} card={c} onPress={() => setSheet({ type: "why", payload: c })} />
          ))}
        </View>
      )}

      {/* Overview Grid (3×N) */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}><Ionicons name="grid" size={16} color="#fff" /> All cards overview</Text>
          <Text style={styles.muted}>Tap a tile → expand</Text>
        </View>
        <FlatList
          data={plan.cards}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <Tile card={item} onPress={() => setSheet({ type: "card", payload: item })} />
          )}
          columnWrapperStyle={{ gap: 8 }}
          contentContainerStyle={{ gap: 8 }}
          scrollEnabled={false}
        />
      </View>

      {/* Mini trend */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Utilization trend</Text>
          <Text style={styles.muted}>Target 10%</Text>
        </View>
        <LineChart
          data={{ labels: ["W1","W2","W3","Now"], datasets: [{ data: [28, 22, 18, 10] }] }}
          width={chartW} height={chartH}
          chartConfig={{
            backgroundGradientFrom: "#0b0b0b",
            backgroundGradientTo: "#0b0b0b",
            color: () => "#34d399",
            decimalPlaces: 0,
            labelColor: () => "#aaa",
            propsForDots: { r: "0" },
          }}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          style={{ borderRadius: 12 }}
        />
        <Text style={styles.mutedSmall}>Earlier-in-cycle payments lower your average daily balance and help avoid interest.</Text>
      </View>

      {/* FYI */}
      <View style={styles.section}>
        <Text style={styles.muted}><Ionicons name="information-circle-outline" size={14} color="#aaa" /> Read-only: we never move your money. You choose where/when to pay.</Text>
      </View>

      {/* Bottom Sheets */}
      <BottomSheet visible={!!sheet} onClose={() => setSheet(null)}>
        {sheet?.type === "why"   && sheet.payload && <WhyThis card={sheet.payload} />}
        {sheet?.type === "pay"   && sheet.payload && (
          <PayNow card={sheet.payload}
            onOpen={() => openBankAppOrCopy(sheet.payload!)}
            onCopy={() => Alert.alert("Copied", `Amount $${sheet.payload!.pay}`)}
          />
        )}
        {sheet?.type === "snooze" && sheet.payload && <SnoozeSheet card={sheet.payload} />}
        {sheet?.type === "all"   && <AllCardsSheet cards={sorted} onSelect={(c) => setSheet({ type: "card", payload: c })} />}
        {sheet?.type === "card"  && sheet.payload && (
          <CardDetail card={sheet.payload}
            onPay={() => setSheet({ type: "pay", payload: sheet.payload as GlideCard })}
            onWhy={() => setSheet({ type: "why", payload: sheet.payload as GlideCard })}
          />
        )}
        {sheet?.type === "sort"  && <SortSheet onPickFilter={(f)=>{/* wire if you want live */}} />}
      </BottomSheet>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Components ---------- */

function Kpi({ label, value, icon, sub }:{ label:string; value:string; icon:keyof typeof Ionicons.glyphMap; sub:string }) {
  return (
    <View style={styles.kpi}>
      <View style={styles.rowBetween}><Text style={styles.kpiLabel}>{label}</Text><Ionicons name={icon} size={14} color="#ddd" /></View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiSub}>{sub}</Text>
    </View>
  );
}

function TopAction({ card, onPay, onWhy, onSnooze }:{
  card: GlideCard; onPay:(c:GlideCard)=>void; onWhy:(c:GlideCard)=>void; onSnooze:(c:GlideCard)=>void;
}) {
  const util = utilPercent(card); const tgt = targetPercent(card);
  return (
    <View style={styles.section}>
      <View style={styles.topActionBadge}><Ionicons name="checkmark-circle" size={14} color="#7AF0C7" /><Text style={styles.topActionTxt}>Top action (highest impact)</Text></View>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}><Ionicons name="card" size={20} color="#7AF0C7" /></View>
        <View style={{ flex:1 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{card.brand} ••••{card.last4}</Text>
            <Text style={styles.muted}>Closes {card.closes}</Text>
          </View>
          <Text style={styles.planLine}>Pay <Text style={styles.bold}>${card.pay}</Text> by <Text style={styles.bold}>{card.safeBy}</Text> to close ≤ <Text style={styles.bold}>{tgt}%</Text>.</Text>
          <View style={styles.rowGap}>
            <Pill icon="time-outline" text="Posts in ~2 biz days" />
            <Pill icon="warning-outline" text="Cushion protected" />
          </View>
          <View style={styles.rowGap}>
            <Pressable onPress={()=>onPay(card)} style={styles.btnPrimary}><Text style={styles.btnPrimaryTxt}>Pay now</Text></Pressable>
            <Pressable onPress={()=>onSnooze(card)} style={styles.btn}><Text style={styles.btnTxt}>Snooze</Text></Pressable>
            <Pressable onPress={()=>onWhy(card)} style={styles.btnIcon}><Ionicons name="information-circle" size={18} color="#fff" /></Pressable>
          </View>
        </View>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>Util now: <Text style={styles.bold}>{util}%</Text></Text>
        <Text style={styles.meta}>Target: <Text style={styles.bold}>{tgt}%</Text></Text>
        <Text style={styles.meta}>APR: <Text style={styles.bold}>{card.apr}%</Text></Text>
      </View>
    </View>
  );
}

function CompactRow({ card, onPress }:{ card:GlideCard; onPress:()=>void }) {
  const util = utilPercent(card); const tgt = targetPercent(card); const over = Math.max(0, util - tgt);
  return (
    <Pressable onPress={onPress} style={styles.compactRow}>
      <View style={styles.rowGap}>
        <View style={styles.iconTiny}><Ionicons name="card-outline" size={14} color="#fff" /></View>
        <View>
          <Text style={styles.compactTitle}>{card.brand} ••••{card.last4}</Text>
          <Text style={styles.mutedSmall}>Pay ${card.pay} by {card.safeBy}</Text>
        </View>
      </View>
      <View style={{ alignItems:"flex-end" }}>
        <Text style={styles.mutedSmall}>Over {over}%</Text>
        <View style={styles.utilBarBg}><View style={[styles.utilBarFill, { width: `${Math.min(util,100)}%` }]} /></View>
      </View>
    </Pressable>
  );
}

function Tile({ card, onPress }:{ card:GlideCard; onPress:()=>void }) {
  const util = utilPercent(card); const tgt = targetPercent(card);
  const ok = card.pay === 0 || util <= tgt;
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <View style={styles.rowBetween}>
        <Text style={styles.tileIssuer}>{card.brand.split(" ")[0]}</Text>
        <View style={[styles.badge, { backgroundColor: ok ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)" }]}><Text style={styles.badgeTxt}>{ok ? "OK" : "PAY"}</Text></View>
      </View>
      <Text style={styles.tileLast4}>••••{card.last4}</Text>
      <View style={styles.rowBetween}><Text style={styles.mutedSmall}>{util}% / {tgt}%</Text><Text style={styles.mutedSmall}>{card.pay > 0 ? card.safeBy : card.closes}</Text></View>
      <View style={styles.utilBarBg}><View style={[styles.utilBarFill, { width:`${Math.min(util,100)}%` }]} /></View>
    </Pressable>
  );
}

function SheetBox({ title, line1, line2 }:{ title:string; line1:string; line2?:string }) {
  return (
    <View style={styles.sheetBox}>
      <Text style={styles.sheetLabel}>{title}</Text>
      <Text style={styles.sheetLine}>{line1}</Text>
      {!!line2 && <Text style={styles.sheetSub}>{line2}</Text>}
    </View>
  );
}

function WhyThis({ card }:{ card:GlideCard }) {
  const tgt = targetPercent(card); const gap = gapToTarget(card);
  return (
    <View>
      <Text style={styles.sheetH}>Why this plan?</Text>
      <Text style={styles.sheetP}>
        We aim to close your next statement at ≤ {tgt}%.
        Your limit is ${card.limit.toLocaleString()} and your posted balance is ${card.posted}.
        Paying ${gap} brings you to ≈ {tgt}%.
      </Text>
      <View style={styles.sheetRow}>
        <SheetBox title="Safe-by" line1={card.safeBy} line2={`Posts ${card.pLag}`} />
        <SheetBox title="Impact" line1={`Close at ≤ ${tgt}%`} line2="Est. interest saved: ~$3–$6" />
      </View>
      <Text style={styles.listItem}>• Protects cushion and set-asides first</Text>
      <Text style={styles.listItem}>• Avoids same-day PAD collisions</Text>
      <Text style={styles.listItem}>• Suppressed if safe-by passed</Text>
    </View>
  );
}

function PayNow({ card, onOpen, onCopy }:{ card:GlideCard; onOpen:()=>void; onCopy:()=>void }) {
  return (
    <View>
      <Text style={styles.sheetH}>Pay {card.brand} ••••{card.last4}</Text>
      <Text style={styles.sheetP}>Choose a way to pay. We'll open your bank's bill-pay screen. (Read-only: Glide doesn't move your money.)</Text>
      <View style={styles.sheetRow}>
        <Pressable style={styles.btnPrimary} onPress={onOpen}><Text style={styles.btnPrimaryTxt}>Open banking app</Text></Pressable>
        <Pressable style={styles.btn} onPress={onCopy}><Text style={styles.btnTxt}>Copy amount ${card.pay}</Text></Pressable>
        <Pressable style={[styles.btn, { flexBasis: "100%" }]}><Text style={styles.btnTxt}>Copy payee reference</Text></Pressable>
      </View>
      <Text style={styles.mutedSmall}>Safe-by: {card.safeBy} • Posts {card.pLag}</Text>
    </View>
  );
}

function SnoozeSheet({ card }:{ card:GlideCard }) {
  const opts = ["6h","24h","3d","Next money day"];
  return (
    <View>
      <Text style={styles.sheetH}>Snooze this step</Text>
      <Text style={styles.sheetP}>We'll recalc safe-by and nudge you before it's risky.</Text>
      <View style={styles.sheetRow}>
        {opts.map(o => <Pressable key={o} style={styles.pillBtn}><Text style={styles.pillBtnTxt}>{o}</Text></Pressable>)}
      </View>
      <Text style={styles.mutedSmall}>Cushion and set-asides remain protected.</Text>
    </View>
  );
}

function CardDetail({ card, onPay, onWhy }:{ card:GlideCard; onPay:()=>void; onWhy:()=>void }) {
  const util = utilPercent(card); const tgt = targetPercent(card);
  return (
    <View>
      <View style={styles.rowGap}>
        <View style={styles.iconBox}><Ionicons name="card" size={18} color="#fff" /></View>
        <View>
          <Text style={styles.cardTitle}>{card.brand} ••••{card.last4}</Text>
          <Text style={styles.mutedSmall}>Limit ${card.limit.toLocaleString()} • APR {card.apr}%</Text>
        </View>
      </View>
      <View style={{ marginTop:12 }}>
        <View style={styles.rowBetween}><Text style={styles.mutedSmall}>Utilization</Text><Text style={styles.mutedSmall}>{util}% (target {tgt}%)</Text></View>
        <View style={styles.utilBarBg}><View style={[styles.utilBarFill, { width: `${Math.min(util,100)}%` }]} /></View>
      </View>
      <View style={styles.sheetRow}>
        <SheetBox title="Plan" line1={card.pay > 0 ? `Pay $${card.pay} by ${card.safeBy}` : "You're within target"} line2={`Closes ${card.closes} • Posts ${card.pLag}`} />
        <SheetBox title="Impact" line1={`Close at ≤ ${tgt}%`} line2="Est. interest saved: ~$3–$6" />
      </View>
      <View style={styles.rowGap}>
        {card.pay > 0 && <Pressable onPress={onPay} style={styles.btnPrimary}><Text style={styles.btnPrimaryTxt}>Pay now</Text></Pressable>}
        <Pressable onPress={onWhy} style={styles.btn}><Text style={styles.btnTxt}>Why this?</Text></Pressable>
      </View>
    </View>
  );
}

function AllCardsSheet({ cards, onSelect }:{ cards:GlideCard[]; onSelect:(c:GlideCard)=>void }) {
  return (
    <View>
      <Text style={styles.sheetH}>All cards</Text>
      {cards.map(c => (
        <Pressable key={c.id} onPress={()=>onSelect(c)} style={styles.listRow}>
          <View style={styles.rowGap}>
            <View style={styles.iconTiny}><Ionicons name="card-outline" size={14} color="#fff" /></View>
            <View>
              <Text style={styles.compactTitle}>{c.brand} ••••{c.last4}</Text>
              <Text style={styles.mutedSmall}>Util {utilPercent(c)}% • Target {targetPercent(c)}%</Text>
            </View>
          </View>
          <Text style={styles.mutedSmall}>{c.pay>0?`Pay $${c.pay} by ${c.safeBy}`:"OK"}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SortSheet({ onPickFilter }:{ onPickFilter?:(f:FilterType)=>void }) {
  const opts = ["Days to close", "Over target %", "APR (high→low)", "Limit (low→high)"];
  const filters: FilterType[] = ["needs", "all", "ok"];
  return (
    <View>
      <Text style={styles.sheetH}>Sort & Filter</Text>
      {opts.map(o => <Pressable key={o} style={styles.listBtn}><Text style={styles.btnTxt}>{o}</Text></Pressable>)}
      <View style={styles.sheetRow}>
        {filters.map(f => (
          <Pressable key={f} onPress={()=>onPickFilter?.(f)} style={styles.pillBtn}><Text style={styles.pillBtnTxt}>{f === "needs" ? "Needs pay" : f.toUpperCase()}</Text></Pressable>
        ))}
      </View>
    </View>
  );
}

function Pill({ icon, text }:{ icon:keyof typeof Ionicons.glyphMap; text:string }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={12} color="#fff" />
      <Text style={styles.pillTxt}>{text}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0b" },
  root: { flex: 1 },

  header: { paddingHorizontal:16, paddingTop:16, paddingBottom:8 },
  headerRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  headerLeft: { flexDirection:"row", gap:6, alignItems:"center" },
  headerRight: { flexDirection:"row", gap:8 },
  caption: { color:"#7AF0C7", fontSize:12, letterSpacing:1.2, textTransform:"uppercase" },

  h1: { color:"#fff", fontSize:24, fontWeight:"700", marginTop:6 },
  sub: { color:"rgba(255,255,255,0.7)", fontSize:13, marginTop:4 },

  kpiRow: { flexDirection:"row", gap:8, marginTop:12 },
  kpi: { flex:1, backgroundColor:"rgba(255,255,255,0.06)", borderColor:"rgba(255,255,255,0.12)", borderWidth:1, borderRadius:16, padding:12 },
  kpiLabel: { color:"rgba(255,255,255,0.7)", fontSize:12 },
  kpiValue: { color:"#fff", fontSize:18, fontWeight:"700", marginTop:2 },
  kpiSub: { color:"rgba(255,255,255,0.6)", fontSize:11, marginTop:2 },

  section: { paddingHorizontal:16, marginTop:12 },
  rowBetween: { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  rowGap: { flexDirection:"row", alignItems:"center", gap:8 },

  sectionTitle: { color:"#fff", fontSize:14, fontWeight:"600" },
  link: { color:"#9ae6b4", fontSize:12 },
  muted: { color:"rgba(255,255,255,0.6)", fontSize:12 },
  mutedSmall: { color:"rgba(255,255,255,0.6)", fontSize:11 },

  topActionBadge: { flexDirection:"row", alignItems:"center", gap:6, marginBottom:8 },
  topActionTxt: { color:"#7AF0C7", fontSize:12, fontWeight:"600" },
  cardRow: { flexDirection:"row", backgroundColor:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.12)", borderWidth:1, borderRadius:20, padding:12 },
  iconBox: { width:40, height:40, borderRadius:12, backgroundColor:"rgba(255,255,255,0.08)", alignItems:"center", justifyContent:"center" },
  iconTiny: { width:24, height:24, borderRadius:8, backgroundColor:"rgba(255,255,255,0.12)", alignItems:"center", justifyContent:"center" },
  cardTitle: { color:"#fff", fontSize:14, fontWeight:"600" },
  planLine: { color:"rgba(255,255,255,0.85)", fontSize:13, marginTop:2 },
  bold: { fontWeight:"700", color:"#fff" },
  metaRow: { flexDirection:"row", gap:12, marginTop:10 },
  meta: { color:"rgba(255,255,255,0.7)", fontSize:11 },

  compactRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", backgroundColor:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.12)", borderWidth:1, borderRadius:14, padding:10, marginTop:8 },
  compactTitle: { color:"#fff", fontSize:13, fontWeight:"600" },

  tile: { flex:1/3, backgroundColor:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.12)", borderWidth:1, borderRadius:14, padding:8, minWidth:(W-32-16)/3 },
  tileIssuer: { color:"rgba(255,255,255,0.6)", fontSize:11 },
  tileLast4: { color:"#fff", fontSize:14, fontWeight:"600", marginVertical:2 },

  utilBarBg: { marginTop:6, width:"100%", height:6, borderRadius:6, backgroundColor:"rgba(255,255,255,0.12)" },
  utilBarFill: { height:"100%", borderRadius:6, backgroundColor:"#34d399" },

  btnPrimary: { flex:1, backgroundColor:"#34d399", borderRadius:12, paddingVertical:10, alignItems:"center" },
  btnPrimaryTxt: { color:"#000", fontWeight:"700" },
  btn: { paddingHorizontal:14, paddingVertical:10, backgroundColor:"rgba(255,255,255,0.1)", borderRadius:12 },
  btnIcon: { paddingHorizontal:12, paddingVertical:10, backgroundColor:"rgba(255,255,255,0.1)", borderRadius:12 },
  btnTxt: { color:"#fff" },

  sheetH: { color:"#fff", fontSize:18, fontWeight:"700", marginBottom:6 },
  sheetP: { color:"rgba(255,255,255,0.7)", fontSize:13 },
  sheetRow: { flexDirection:"row", gap:8, marginTop:12, flexWrap:"wrap" },
  sheetBox: { flex:1, minWidth:(W-32-8)/2, backgroundColor:"rgba(255,255,255,0.06)", borderColor:"rgba(255,255,255,0.12)", borderWidth:1, borderRadius:14, padding:12 },
  sheetLabel: { color:"rgba(255,255,255,0.6)", fontSize:11 },
  sheetLine: { color:"#fff", fontSize:14, fontWeight:"600", marginTop:2 },
  sheetSub: { color:"rgba(255,255,255,0.6)", fontSize:11, marginTop:2 },
  listItem: { color:"rgba(255,255,255,0.7)", fontSize:13, marginTop:6 },

  listRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical:10, borderBottomColor:"rgba(255,255,255,0.08)", borderBottomWidth:1 },
  listBtn: { paddingVertical:10, borderRadius:12, backgroundColor:"rgba(255,255,255,0.08)", marginTop:8, alignItems:"center" },

  pill: { flexDirection:"row", gap:6, alignItems:"center", paddingHorizontal:10, paddingVertical:6, backgroundColor:"rgba(255,255,255,0.1)", borderRadius:999 },
  pillBtn: { paddingHorizontal:12, paddingVertical:8, backgroundColor:"rgba(255,255,255,0.1)", borderRadius:999 },
  pillBtnTxt: { color:"#fff", fontSize:12 },
  pillTxt: { color:"#fff", fontSize:12 },

  badge: { paddingHorizontal:6, paddingVertical:2, borderRadius:6 },
  badgeTxt: { color:"#fff", fontSize:10, fontWeight:"600" },
});
