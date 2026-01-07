"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabaseClient";
import VoiceAssistant from "./components/VoiceAssistant";
import AiInsights, {
  Transaction,
  TransactionType,
} from "./components/AiInsights";
import SpendingByCategoryChart from "./components/SpendingByCategoryChart";

type FormType = TransactionType;

interface FormState {
  type: FormType;
  amount: string;
  category: string;
  date: string;
  note: string;
}

type CurrencyDef = {
  code: string;
  symbol: string;
  label: string;
};

/**
 * Global currencies – built from your list.
 * (Labels are "Country – Currency (CODE)")
 */
const CURRENCIES: CurrencyDef[] = [
  // Africa
  { code: "DZD", symbol: "د.ج", label: "Algeria – Algerian dinar (DZD)" },
  { code: "AOA", symbol: "Kz", label: "Angola – Kwanza (AOA)" },
  { code: "XOF", symbol: "CFA", label: "Benin – West African CFA franc (XOF)" },
  { code: "BWP", symbol: "P", label: "Botswana – Pula (BWP)" },
  { code: "XOF", symbol: "CFA", label: "Burkina Faso – West African CFA franc (XOF)" },
  { code: "BIF", symbol: "FBu", label: "Burundi – Burundian franc (BIF)" },
  { code: "CVE", symbol: "Esc", label: "Cabo Verde – Cabo Verdean escudo (CVE)" },
  { code: "XAF", symbol: "CFA", label: "Cameroon – Central African CFA franc (XAF)" },
  { code: "XAF", symbol: "CFA", label: "Central African Republic – Central African CFA franc (XAF)" },
  { code: "XAF", symbol: "CFA", label: "Chad – Central African CFA franc (XAF)" },
  { code: "KMF", symbol: "CF", label: "Comoros – Comorian franc (KMF)" },
  { code: "XAF", symbol: "CFA", label: "Congo (Republic) – Central African CFA franc (XAF)" },
  { code: "CDF", symbol: "FC", label: "Congo (DRC) – Congolese franc (CDF)" },
  { code: "XOF", symbol: "CFA", label: "Côte d’Ivoire – West African CFA franc (XOF)" },
  { code: "DJF", symbol: "Fdj", label: "Djibouti – Djiboutian franc (DJF)" },
  { code: "EGP", symbol: "£", label: "Egypt – Egyptian pound (EGP)" },
  { code: "XAF", symbol: "CFA", label: "Equatorial Guinea – Central African CFA franc (XAF)" },
  { code: "ERN", symbol: "Nfk", label: "Eritrea – Nakfa (ERN)" },
  { code: "SZL", symbol: "L", label: "Eswatini – Lilangeni (SZL)" },
  { code: "ETB", symbol: "Br", label: "Ethiopia – Birr (ETB)" },
  { code: "XAF", symbol: "CFA", label: "Gabon – Central African CFA franc (XAF)" },
  { code: "GMD", symbol: "D", label: "Gambia – Dalasi (GMD)" },
  { code: "GHS", symbol: "₵", label: "Ghana – Ghanaian cedi (GHS)" },
  { code: "GNF", symbol: "FG", label: "Guinea – Guinean franc (GNF)" },
  { code: "XOF", symbol: "CFA", label: "Guinea-Bissau – West African CFA franc (XOF)" },
  { code: "KES", symbol: "Ksh", label: "Kenya – Kenyan shilling (KES)" },
  { code: "LSL", symbol: "L", label: "Lesotho – Loti (LSL)" },
  { code: "LRD", symbol: "$", label: "Liberia – Liberian dollar (LRD)" },
  { code: "LYD", symbol: "ل.د", label: "Libya – Libyan dinar (LYD)" },
  { code: "MGA", symbol: "Ar", label: "Madagascar – Malagasy ariary (MGA)" },
  { code: "MWK", symbol: "MK", label: "Malawi – Malawian kwacha (MWK)" },
  { code: "XOF", symbol: "CFA", label: "Mali – West African CFA franc (XOF)" },
  { code: "MRU", symbol: "UM", label: "Mauritania – Ouguiya (MRU)" },
  { code: "MUR", symbol: "₨", label: "Mauritius – Mauritian rupee (MUR)" },
  { code: "MAD", symbol: "د.م", label: "Morocco – Moroccan dirham (MAD)" },
  { code: "MZN", symbol: "MT", label: "Mozambique – Metical (MZN)" },
  { code: "NAD", symbol: "$", label: "Namibia – Namibian dollar (NAD)" },
  { code: "XOF", symbol: "CFA", label: "Niger – West African CFA franc (XOF)" },
  { code: "NGN", symbol: "₦", label: "Nigeria – Naira (NGN)" },
  { code: "RWF", symbol: "FRw", label: "Rwanda – Rwandan franc (RWF)" },
  { code: "STN", symbol: "Db", label: "São Tomé and Príncipe – Dobra (STN)" },
  { code: "XOF", symbol: "CFA", label: "Senegal – West African CFA franc (XOF)" },
  { code: "SCR", symbol: "₨", label: "Seychelles – Seychelles rupee (SCR)" },
  { code: "SLE", symbol: "Le", label: "Sierra Leone – Leone (SLE)" },
  { code: "SOS", symbol: "Sh", label: "Somalia – Somali shilling (SOS)" },
  { code: "ZAR", symbol: "R", label: "South Africa – Rand (ZAR)" },
  { code: "SSP", symbol: "£", label: "South Sudan – South Sudanese pound (SSP)" },
  { code: "SDG", symbol: "£", label: "Sudan – Sudanese pound (SDG)" },
  { code: "TZS", symbol: "Sh", label: "Tanzania – Tanzanian shilling (TZS)" },
  { code: "XOF", symbol: "CFA", label: "Togo – West African CFA franc (XOF)" },
  { code: "TND", symbol: "د.ت", label: "Tunisia – Tunisian dinar (TND)" },
  { code: "UGX", symbol: "USh", label: "Uganda – Ugandan shilling (UGX)" },
  { code: "ZMW", symbol: "ZK", label: "Zambia – Zambian kwacha (ZMW)" },
  { code: "ZWL", symbol: "Z$", label: "Zimbabwe – Zimbabwean dollar (ZWL)" },

  // Americas & Caribbean
  { code: "XCD", symbol: "$", label: "East Caribbean dollar (XCD)" },
  { code: "ARS", symbol: "$", label: "Argentina – Argentine peso (ARS)" },
  { code: "BSD", symbol: "$", label: "Bahamas – Bahamian dollar (BSD)" },
  { code: "BBD", symbol: "Bds$", label: "Barbados – Barbadian dollar (BBD)" },
  { code: "BZD", symbol: "BZ$", label: "Belize – Belize dollar (BZD)" },
  { code: "BOB", symbol: "Bs", label: "Bolivia – Boliviano (BOB)" },
  { code: "BRL", symbol: "R$", label: "Brazil – Brazilian real (BRL)" },
  { code: "CAD", symbol: "C$", label: "Canada – Canadian dollar (CAD)" },
  { code: "CLP", symbol: "$", label: "Chile – Chilean peso (CLP)" },
  { code: "COP", symbol: "$", label: "Colombia – Colombian peso (COP)" },
  { code: "CRC", symbol: "₡", label: "Costa Rica – Costa Rican colón (CRC)" },
  { code: "CUP", symbol: "$", label: "Cuba – Cuban peso (CUP)" },
  { code: "DOP", symbol: "RD$", label: "Dominican Republic – Dominican peso (DOP)" },
  { code: "USD", symbol: "$", label: "US dollar (USD)" },
  { code: "GTQ", symbol: "Q", label: "Guatemala – Quetzal (GTQ)" },
  { code: "GYD", symbol: "$", label: "Guyana – Guyanese dollar (GYD)" },
  { code: "HTG", symbol: "G", label: "Haiti – Gourde (HTG)" },
  { code: "HNL", symbol: "L", label: "Honduras – Lempira (HNL)" },
  { code: "JMD", symbol: "J$", label: "Jamaica – Jamaican dollar (JMD)" },
  { code: "MXN", symbol: "$", label: "Mexico – Mexican peso (MXN)" },
  { code: "NIO", symbol: "C$", label: "Nicaragua – Córdoba (NIO)" },
  { code: "PAB", symbol: "B/.", label: "Panama – Balboa (PAB)" },
  { code: "PYG", symbol: "₲", label: "Paraguay – Guaraní (PYG)" },
  { code: "PEN", symbol: "S/.", label: "Peru – Sol (PEN)" },
  { code: "SRD", symbol: "$", label: "Suriname – Surinamese dollar (SRD)" },
  { code: "TTD", symbol: "TT$", label: "Trinidad and Tobago – Dollar (TTD)" },
  { code: "UYU", symbol: "$U", label: "Uruguay – Uruguayan peso (UYU)" },
  { code: "VES", symbol: "Bs", label: "Venezuela – Bolívar (VES)" },

  // Asia
  { code: "AFN", symbol: "؋", label: "Afghanistan – Afghani (AFN)" },
  { code: "AMD", symbol: "֏", label: "Armenia – Dram (AMD)" },
  { code: "AZN", symbol: "₼", label: "Azerbaijan – Manat (AZN)" },
  { code: "BHD", symbol: "ب.د", label: "Bahrain – Bahraini dinar (BHD)" },
  { code: "BDT", symbol: "৳", label: "Bangladesh – Taka (BDT)" },
  { code: "BTN", symbol: "Nu.", label: "Bhutan – Ngultrum (BTN)" },
  { code: "BND", symbol: "B$", label: "Brunei – Brunei dollar (BND)" },
  { code: "KHR", symbol: "៛", label: "Cambodia – Riel (KHR)" },
  { code: "CNY", symbol: "¥", label: "China – Renminbi yuan (CNY)" },
  { code: "GEL", symbol: "₾", label: "Georgia – Lari (GEL)" },
  { code: "INR", symbol: "₹", label: "India – Indian rupee (INR)" },
  { code: "IDR", symbol: "Rp", label: "Indonesia – Rupiah (IDR)" },
  { code: "IRR", symbol: "﷼", label: "Iran – Iranian rial (IRR)" },
  { code: "IQD", symbol: "ع.د", label: "Iraq – Iraqi dinar (IQD)" },
  { code: "ILS", symbol: "₪", label: "Israel – New shekel (ILS)" },
  { code: "JPY", symbol: "¥", label: "Japan – Yen (JPY)" },
  { code: "JOD", symbol: "د.أ", label: "Jordan – Jordanian dinar (JOD)" },
  { code: "KZT", symbol: "₸", label: "Kazakhstan – Tenge (KZT)" },
  { code: "KWD", symbol: "د.ك", label: "Kuwait – Kuwaiti dinar (KWD)" },
  { code: "KGS", symbol: "с", label: "Kyrgyzstan – Som (KGS)" },
  { code: "LAK", symbol: "₭", label: "Laos – Kip (LAK)" },
  { code: "LBP", symbol: "ل.ل", label: "Lebanon – Lebanese pound (LBP)" },
  { code: "MYR", symbol: "RM", label: "Malaysia – Ringgit (MYR)" },
  { code: "MVR", symbol: "Rf", label: "Maldives – Rufiyaa (MVR)" },
  { code: "MNT", symbol: "₮", label: "Mongolia – Tögrög (MNT)" },
  { code: "MMK", symbol: "K", label: "Myanmar – Kyat (MMK)" },
  { code: "NPR", symbol: "₨", label: "Nepal – Nepalese rupee (NPR)" },
  { code: "KPW", symbol: "₩", label: "North Korea – Won (KPW)" },
  { code: "OMR", symbol: "ر.ع", label: "Oman – Omani rial (OMR)" },
  { code: "PKR", symbol: "₨", label: "Pakistan – Pakistani rupee (PKR)" },
  { code: "PHP", symbol: "₱", label: "Philippines – Peso (PHP)" },
  { code: "QAR", symbol: "ر.ق", label: "Qatar – Qatari riyal (QAR)" },
  { code: "SAR", symbol: "ر.س", label: "Saudi Arabia – Riyal (SAR)" },
  { code: "SGD", symbol: "S$", label: "Singapore – Singapore dollar (SGD)" },
  { code: "KRW", symbol: "₩", label: "South Korea – Won (KRW)" },
  { code: "LKR", symbol: "රු", label: "Sri Lanka – Rupee (LKR)" },
  { code: "SYP", symbol: "£", label: "Syria – Syrian pound (SYP)" },
  { code: "TWD", symbol: "NT$", label: "Taiwan – New Taiwan dollar (TWD)" },
  { code: "TJS", symbol: "SM", label: "Tajikistan – Somoni (TJS)" },
  { code: "THB", symbol: "฿", label: "Thailand – Baht (THB)" },
  { code: "TRY", symbol: "₺", label: "Turkey – Turkish lira (TRY)" },
  { code: "TMT", symbol: "m", label: "Turkmenistan – Manat (TMT)" },
  { code: "AED", symbol: "د.إ", label: "UAE – Dirham (AED)" },
  { code: "UZS", symbol: "so'm", label: "Uzbekistan – Soʻm (UZS)" },
  { code: "VND", symbol: "₫", label: "Vietnam – Đồng (VND)" },
  { code: "YER", symbol: "﷼", label: "Yemen – Rial (YER)" },

  // Europe
  { code: "EUR", symbol: "€", label: "Eurozone – Euro (EUR)" },
  { code: "ALL", symbol: "L", label: "Albania – Lek (ALL)" },
  { code: "BYN", symbol: "Br", label: "Belarus – Belarusian ruble (BYN)" },
  { code: "BAM", symbol: "KM", label: "Bosnia and Herzegovina – Convertible mark (BAM)" },
  { code: "BGN", symbol: "лв", label: "Bulgaria – Lev (BGN)" },
  { code: "CZK", symbol: "Kč", label: "Czech Republic – Koruna (CZK)" },
  { code: "DKK", symbol: "kr", label: "Denmark – Krone (DKK)" },
  { code: "HUF", symbol: "Ft", label: "Hungary – Forint (HUF)" },
  { code: "ISK", symbol: "kr", label: "Iceland – Króna (ISK)" },
  { code: "MDL", symbol: "L", label: "Moldova – Leu (MDL)" },
  { code: "MKD", symbol: "ден", label: "North Macedonia – Denar (MKD)" },
  { code: "NOK", symbol: "kr", label: "Norway – Krone (NOK)" },
  { code: "PLN", symbol: "zł", label: "Poland – Złoty (PLN)" },
  { code: "RON", symbol: "lei", label: "Romania – Leu (RON)" },
  { code: "RUB", symbol: "₽", label: "Russia – Ruble (RUB)" },
  { code: "RSD", symbol: "дин.", label: "Serbia – Serbian dinar (RSD)" },
  { code: "SEK", symbol: "kr", label: "Sweden – Krona (SEK)" },
  { code: "CHF", symbol: "Fr", label: "Switzerland – Swiss franc (CHF)" },
  { code: "UAH", symbol: "₴", label: "Ukraine – Hryvnia (UAH)" },
  { code: "GBP", symbol: "£", label: "United Kingdom – Pound sterling (GBP)" },

  // Oceania & Pacific
  { code: "AUD", symbol: "A$", label: "Australia – Australian dollar (AUD)" },
  { code: "FJD", symbol: "$", label: "Fiji – Fiji dollar (FJD)" },
  { code: "NZD", symbol: "NZ$", label: "New Zealand – New Zealand dollar (NZD)" },
  { code: "PGK", symbol: "K", label: "Papua New Guinea – Kina (PGK)" },
  { code: "SBD", symbol: "$", label: "Solomon Islands – Dollar (SBD)" },
  { code: "WST", symbol: "T", label: "Samoa – Tala (WST)" },
  { code: "TOP", symbol: "T$", label: "Tonga – Paʻanga (TOP)" },
  { code: "VUV", symbol: "Vt", label: "Vanuatu – Vatu (VUV)" },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [spokenLog, setSpokenLog] = useState<string | null>(null);

  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [form, setForm] = useState<FormState>({
    type: "income",
    amount: "",
    category: "",
    date: todayStr,
    note: "",
  });

  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const currency = useMemo(
    () => CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0],
    [currencyCode]
  );

  const [monthlyBudget, setMonthlyBudget] = useState<number>(1000);

  // 👉 Check auth on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error("Error getting user or missing session:", error);
        setUser(null);
        setAuthChecked(true);
        router.replace("/login?reason=expired");
        return;
      }
      setUser(data.user);
      setAuthChecked(true);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // 👉 Load transactions when user available
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setTransactions([]);
        return;
      }
      setLoadingTx(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading transactions:", error.message ?? error);
        alert(`Error loading transactions: ${error.message ?? "Unknown error"}`);
        setTransactions([]);
      } else if (data) {
        const mapped: Transaction[] = data.map((row: {
          id: number | string;
          type: string;
          amount: number | string;
          category: string;
          date: string;
          note: string | null;
          currency_code?: string;
        }) => ({
          id: Number(row.id),
          type: row.type as TransactionType,
          amount: Number(row.amount),
          category: row.category,
          date: row.date,
          note: row.note ?? null,
          currency_code: row.currency_code ?? "USD",
        }));
        setTransactions(mapped);
      }
      setLoadingTx(false);
    };

    fetchTransactions();
  }, [user]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  const monthlySummary = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        income: 0,
        expense: 0,
        net: 0,
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      // t.date is string like "2025-01-06"
      const d = new Date(t.date);
      if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) {
        continue;
      }

      if (t.type === "income") {
        income += t.amount;
      } else if (t.type === "expense") {
        expense += t.amount;
      }
    }

    return {
      income,
      expense,
      net: income - expense,
    };
  }, [transactions]);

  const remainingBudget = useMemo(() => {
    if (!monthlyBudget || monthlyBudget <= 0) return null;
    const used = totals.expense;
    return {
      used,
      left: monthlyBudget - used,
      percentUsed: Math.min(100, (used / monthlyBudget) * 100),
    };
  }, [monthlyBudget, totals.expense]);

  const handleChange = (
    field: keyof FormState,
    value: string | FormType
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  type CreateTxInput = {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string | null;
    currency_code: string;
  };

  const createTransaction = async (input: CreateTxInput): Promise<Transaction> => {
    if (!user) {
      throw new Error("Please log in.");
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: input.type,
        amount: input.amount,
        category: input.category,
        date: input.date || todayStr,
        note: input.note ?? null,
        currency_code: input.currency_code,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting transaction:", error);
      throw error;
    }

    return {
      id: Number(data.id),
      type: data.type as TransactionType,
      amount: Number(data.amount),
      category: data.category,
      date: data.date,
      note: data.note ?? null,
      currency_code: data.currency_code ?? "USD",
    };
  };

  const handleAdd = async () => {
    if (!user) {
      alert("Please log in to add transactions.");
      return;
    }

    const amountNum = Number(form.amount);
    if (!amountNum || amountNum <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!form.category.trim()) {
      alert("Please enter a category.");
      return;
    }

    try {
      const newTx = await createTransaction({
        type: form.type,
        amount: amountNum,
        category: form.category.trim(),
        date: form.date || todayStr,
        note: form.note.trim() || null,
        currency_code: currencyCode,
      });

      setTransactions((prev) => [newTx, ...prev]);
      setForm((prev) => ({
        ...prev,
        amount: "",
        category: "",
        note: "",
      }));
    } catch {
      alert("Could not save transaction. Try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!user) {
      alert("Please log in.");
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting transaction:", error);
      alert("Could not delete. Try again.");
      return;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // 🔊 Voice handler – ADD or DELETE/TRUNCATE transactions (with DB)
  const handleVoiceText = async (spoken: string) => {
    setSpokenLog(spoken);
    console.log("Voice input:", spoken);

    if (!user) {
      console.log("No user logged in; ignoring voice command.");
      return;
    }

    const text = spoken.toLowerCase();

    // 1) Extract number (supports 5,000 / 10,000 / 5000 / 69.00)
    const amountMatch = text.match(/(\d[\d,]*(?:\.\d+)?)/);
    const amount = amountMatch
      ? Number(amountMatch[1].replace(/,/g, ""))
      : null;

    // 2) Map keywords -> category
    const catMap: { [key: string]: string } = {
      food: "Food",
      pizza: "Food",
      restaurant: "Food",
      coffee: "Coffee",
      starbucks: "Coffee",
      fuel: "Fuel",
      gas: "Fuel",
      petrol: "Fuel",
      rent: "Rent",
      room: "Rent",
      uber: "Transport",
      taxi: "Transport",
      bus: "Transport",
      bag: "Shopping",
      clothes: "Shopping",
      shopping: "Shopping",
      beauty: "Beauty",
      salon: "Beauty",
      income: "Income",
      salary: "Income",
      wage: "Income",
      wages: "Income",
    };

    let category = "Voice";
    for (const key of Object.keys(catMap)) {
      if (text.includes(key)) {
        category = catMap[key];
        break;
      }
    }

    // 3) Check if it's a DELETE / TRUNCATE style command
    const isDeleteCommand = ["delete", "remove", "truncate", "cancel"].some(
      (word) => text.includes(word)
    );

    if (isDeleteCommand) {
      if (transactions.length === 0) {
        console.log("No transactions to delete.");
        return;
      }

      const catLower = category.toLowerCase();
      let txToDelete: Transaction | null = null;

      for (const t of transactions) {
        const amountOk = amount
          ? Math.round(t.amount) === Math.round(amount)
          : true;

        const tCat = t.category.toLowerCase();
        const categoryOk =
          category !== "Voice"
            ? tCat === catLower || text.includes(tCat)
            : true;

        if (amountOk && categoryOk) {
          txToDelete = t;
          break;
        }
      }

      if (!txToDelete) {
        console.log(
          "Voice delete: could not find a matching transaction to delete."
        );
        return;
      }

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", txToDelete.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Voice delete DB error:", error);
        return;
      }

      setTransactions((prev) => prev.filter((t) => t.id !== txToDelete!.id));
      return;
    }

    // 4) Otherwise treat as ADD transaction

    let type: TransactionType = "expense";
    if (
      text.includes("salary") ||
      text.includes("income") ||
      text.includes("got paid") ||
      text.includes("received") ||
      text.includes("wage")
    ) {
      type = "income";
    }

    if (!amount || amount <= 0) {
      console.log("Could not find a valid amount in voice text:", spoken);
      return;
    }

    const payload = {
      type,
      amount,
      category,
      date: todayStr,
      note: spoken,
      currency_code: currencyCode,
    };

    try {
      const newTx = await createTransaction(payload);
      setTransactions((prev) => [newTx, ...prev]);
    } catch (error) {
      console.error("Voice insert error:", error);
    }
  };

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-300">Checking session…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl bg-slate-900/80 p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">WageWise</h1>
          <p className="text-xs text-slate-400 mb-4">
            AI-powered money coach for people with irregular income.
          </p>
          <p className="text-xs text-slate-300 mb-4">
            Please create an account or log in to start tracking your wages and expenses.
          </p>
          <div className="flex flex-col gap-2 text-xs">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-emerald-500 py-2 font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-slate-600 py-2 font-semibold text-slate-100 hover:bg-slate-800"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header + currency + user */}
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WageWise</h1>
            <p className="mt-1 text-sm text-slate-400">
              AI money coach for people with irregular income.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Currency</span>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CURRENCIES.map((c, index) => (
                  <option key={`${c.code}-${index}`} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                {user.email ?? "Logged in"}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-100 hover:bg-slate-700"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* Monthly Summary cards */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              This Month – Income
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {currency.symbol}{" "}
              {monthlySummary.income.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              This Month – Expenses
            </p>
            <p className="mt-2 text-2xl font-semibold text-rose-400">
              {currency.symbol}{" "}
              {monthlySummary.expense.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              This Month – Net
            </p>
            <p
              className={
                "mt-2 text-2xl font-semibold " +
                (monthlySummary.net >= 0 ? "text-emerald-400" : "text-rose-400")
              }
            >
              {currency.symbol}{" "}
              {monthlySummary.net.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </section>

        {/* Budget bar */}
        {remainingBudget && (
          <section className="mb-6 rounded-2xl bg-slate-900/70 p-4 text-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-slate-400 mb-1">Monthly expense budget</p>
                <p className="text-slate-200">
                  {currency.symbol}
                  {monthlyBudget.toFixed(2)} total · Used{" "}
                  <span
                    className={
                      remainingBudget.percentUsed > 90
                        ? "text-rose-400"
                        : remainingBudget.percentUsed > 70
                        ? "text-amber-300"
                        : "text-emerald-400"
                    }
                  >
                    {currency.symbol}
                    {remainingBudget.used.toFixed(2)} (
                    {remainingBudget.percentUsed.toFixed(0)}%)
                  </span>{" "}
                  · Left {currency.symbol}
                  {remainingBudget.left.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Set budget:</span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) =>
                    setMonthlyBudget(Number(e.target.value) || 0)
                  }
                  className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
              <div
                className={`h-2 rounded-full ${
                  remainingBudget.percentUsed > 90
                    ? "bg-rose-500"
                    : remainingBudget.percentUsed > 70
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${remainingBudget.percentUsed}%` }}
              />
            </div>
          </section>
        )}

        {/* Spending by Category Chart */}
        <section className="mb-6">
          <SpendingByCategoryChart
            transactions={transactions}
            currencySymbol={currency.symbol}
          />
        </section>

        {/* Add transaction form */}
        <section className="rounded-2xl bg-slate-900/70 p-4">
          <h2 className="mb-3 text;base font-semibold">Add transaction</h2>

          <div className="grid gap-3 md:grid-cols-4">
            {/* Type */}
            <div className="flex flex-col text-xs">
              <label className="mb-1 text-slate-400">Type</label>
              <select
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.type}
                onChange={(e) =>
                  handleChange("type", e.target.value as FormType)
                }
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Amount */}
            <div className="flex flex-col text-xs">
              <label className="mb-1 text-slate-400">
                Amount ({currency.symbol})
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col text-xs">
              <label className="mb-1 text-slate-400">Category</label>
              <input
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Food, Rent, Fuel..."
              />
            </div>

            {/* Date */}
            <div className="flex flex-col text-xs">
              <label className="mb-1 text-slate-400">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Note + Add button */}
          <div className="mt-3 flex flex-col gap-3 text-xs md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-slate-400">
                Note (optional)
              </label>
              <input
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Short note"
              />
            </div>

            <button
              onClick={handleAdd}
              className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Add
            </button>
          </div>
        </section>

        {/* Voice Assistant */}
        <section className="mt-6 rounded-2xl bg-slate-900/70 p-4 text-sm">
          <h2 className="mb-2 text-base font-semibold">🎙 Voice Assistant</h2>
          <p className="mb-2 text-xs text-slate-400">
            Say things like:{" "}
            <span className="italic">
              &quot;Hey WageWise, add 200 wage income&quot;, &quot;add 50 for
              food&quot; or &quot;delete 200 wage&quot;
            </span>
          </p>

          <VoiceAssistant onTextFinal={handleVoiceText} />

          {spokenLog && (
            <p className="mt-2 text-xs text-slate-400">
              Last voice command:{" "}
              <span className="italic text-slate-200">
                &quot;{spokenLog}&quot;
              </span>
            </p>
          )}
        </section>

        {/* AI Coach */}
        <AiInsights transactions={transactions} currency={currency} />

        {/* Transactions table */}
        <section className="mt-6 rounded-2xl bg-slate-900/70 p-4 text-sm">
          <h2 className="mb-3 text-base font-semibold">Transactions</h2>
          {loadingTx ? (
            <p className="text-xs text-slate-400">Loading your data…</p>
          ) : transactions.length === 0 ? (
            <p className="text-xs text-slate-400">
              No transactions yet. Add your first one above or use voice.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Note</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="py-2 pr-3 text-slate-300">{t.date}</td>
                      <td className="py-2 pr-3 capitalize text-slate-300">
                        {t.type}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {t.category}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={
                            t.type === "income"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }
                        >
                          {currency.symbol}
                          {t.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-slate-400">
                        {t.note ?? "-"}
                      </td>
                      <td className="py-2 pr-3">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="rounded-md border border-slate-600 px-2 py-0.5 text-[11px] text-slate-200 hover:bg-slate-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
