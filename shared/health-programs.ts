export interface HealthProgram {
  name: string;
  purpose: string;
  eligibility: string;
  benefits: string;
  required_documents: string[];
  cost: string;
  how_to_apply: string;
  notes: string;
}

export const healthPrograms: HealthProgram[] = [
  {
    name: "Sehat Sahulat Program (Sehat Insaf / Sehat Card)",
    purpose: "Cashless inpatient health insurance for major procedures, emergency care, maternity and chronic illnesses.",
    eligibility: "Pakistani citizens; prioritized families listed in NSER/BISP; universal in some provinces (e.g., KP Sehat Card Plus).",
    benefits: "Cashless inpatient treatment at empanelled hospitals; coverage ceilings vary by province (commonly PKR 1,000,000+ per family/year depending on variant).",
    required_documents: ["CNIC (or B-Form for children)", "Family CNIC (if requested)"],
    cost: "Free for covered services",
    how_to_apply: "Check eligibility (SMS CNIC to designated short code or provincial helpline); present CNIC at empanelled hospital; hospital verifies and bills the scheme.",
    notes: "Coverage limits, covered procedures and hospital lists vary by province and scheme variant. Some provinces use CNIC as the card (no physical card required)."
  },
  {
    name: "Benazir Nashonuma Programme",
    purpose: "Improve maternal and child nutrition, reduce stunting and support healthy child growth (0–23 months).",
    eligibility: "Pregnant/lactating women and children under 2; typically targeted at BISP-registered low-income families (Kafaalat).",
    benefits: "Quarterly cash transfers and nutrition support, nutrition counselling, linkages to immunization and health check-ups.",
    required_documents: ["Mother's CNIC", "Child B-Form (where applicable)", "Immunization card/health record"],
    cost: "Free (social protection + nutrition transfers)",
    how_to_apply: "Register at Nashonuma centers, local health facility or via BISP/field staff; attend required check-ups to receive payments.",
    notes: "Payment channels and exact transfer amounts can change with program updates; attendance at health sessions is usually required."
  },
  {
    name: "Benazir Income Support Program (BISP) — Health & Nutrition components",
    purpose: "Cash transfers and conditional support for extremely poor households, with nutrition/health linkages.",
    eligibility: "Households identified by BISP means-test / NSER as below poverty threshold.",
    benefits: "Regular cash transfers; linkages to health and nutrition programs (e.g., Nashonuma); referral assistance.",
    required_documents: ["Household CNIC (head of family)", "Any BISP-specific registration documents"],
    cost: "Cash transfers (free to beneficiaries)",
    how_to_apply: "Apply/register via BISP enrollment centers or verify through BISP helpline/field teams.",
    notes: "BISP is a federal social protection program; health linkages depend on provincial implementation."
  },
  {
    name: "Expanded Programme on Immunization (EPI)",
    purpose: "Provide routine childhood and maternal vaccinations to prevent vaccine-preventable diseases.",
    eligibility: "All children (routine schedule), pregnant women for select vaccines; no income or CNIC requirement for basic services.",
    benefits: "Free vaccines (polio, BCG, DPT, HepB, measles, rota, pneumococcal, tetanus etc.) at public EPI centers and outreach camps.",
    required_documents: ["Child immunization card (recommended)"],
    cost: "Free",
    how_to_apply: "Visit local BHU/RHC or government hospital EPI centre or attend outreach vaccination drives.",
    notes: "Schedules and vaccine availability follow national EPI calendar; catch-up campaigns run periodically."
  },
  {
    name: "TB Control Program (National/Provincial)",
    purpose: "Early detection, free diagnosis and complete treatment for Tuberculosis.",
    eligibility: "All persons diagnosed or suspected of TB through public TB diagnostic centers; no income restriction.",
    benefits: "Free diagnostic tests (sputum, Xpert MTB/RIF where available) and full course of anti-TB medicines plus counselling.",
    required_documents: ["CNIC recommended for patient records"],
    cost: "Free",
    how_to_apply: "Visit public TB diagnostic center, district TB control office or partner NGO clinic for screening and registration.",
    notes: "Treatment is standardized (DOTS/WHO guidelines) and reporting is through national TB program systems."
  },
  {
    name: "Malaria Control Program",
    purpose: "Prevent and treat malaria through vector control, diagnostics, treatment and awareness.",
    eligibility: "All residents in endemic areas; clinical suspicion warrants free testing/treatment at public facilities.",
    benefits: "Free rapid diagnostic tests (where available), antimalarial medicines, IRS/LLIN distribution in campaigns.",
    required_documents: ["None generally required; CNIC helpful for records"],
    cost: "Free or subsidized",
    how_to_apply: "Seek care at BHU/RHC or public hospital; participate in community vector control campaigns.",
    notes: "Services concentrated in malaria-endemic districts; campaign schedules are seasonal."
  },
  {
    name: "Hepatitis Prevention & Control Program",
    purpose: "Screening, treatment and prevention of Hepatitis B and C.",
    eligibility: "All citizens for screening and, if diagnosed, for treatment enrollment in government programs (subject to supply/capacity).",
    benefits: "Free or subsidized screening and antiviral treatment through designated public centers; counselling.",
    required_documents: ["CNIC (for enrolment and record)"],
    cost: "Often free or highly subsidized",
    how_to_apply: "Visit designated hepatitis treatment centers, public hospitals or district health offices for screening and enrollment.",
    notes: "Treatment availability may vary by province and budget; some provinces run mass screening campaigns."
  },
  {
    name: "Polio Eradication Initiative (PEI)",
    purpose: "National efforts to eradicate polio via mass immunization and surveillance.",
    eligibility: "All children under specified ages targeted in campaigns (usually under 5; check campaign age).",
    benefits: "Free polio drops during national/sub-national campaigns and routine immunization.",
    required_documents: ["None"],
    cost: "Free",
    how_to_apply: "Parents bring children to immunization points or accept door-to-door vaccination during campaigns.",
    notes: "Campaigns are periodic and coordinated with WHO/UNICEF partners and national EPI."
  },
  {
    name: "Maternal, Newborn & Child Health (MNCH) Program",
    purpose: "Improve antenatal, delivery, postpartum, newborn care and child health outcomes; often integrated with LHW and facility services.",
    eligibility: "Pregnant women, newborns and young children; services are open to all citizens.",
    benefits: "Antenatal check-ups, safe delivery support, newborn care, counselling, referrals and sometimes transport support.",
    required_documents: ["Mother's CNIC recommended; maternity card if available"],
    cost: "Free at public facilities",
    how_to_apply: "Register with nearest BHU/RHC, attend antenatal clinics, or contact Lady Health Worker for community support and referrals.",
    notes: "Linked with community outreach by LHWs for follow-up and referrals."
  },
  {
    name: "Lady Health Worker (LHW) Program",
    purpose: "Community-based primary care outreach: maternal-child health, family planning, basic illness management and referrals.",
    eligibility: "Services provided to households in LHW catchment areas; no formal enrollment for basic services.",
    benefits: "Home visits, antenatal/postnatal follow-up, child growth monitoring, vaccination support and referrals.",
    required_documents: ["None; CNIC may be recorded for specific referrals"],
    cost: "Free",
    how_to_apply: "Contact the local LHW or nearest BHU for enrollment in outreach services.",
    notes: "LHWs are critical to community-level primary care in rural and peri-urban areas."
  },
  {
    name: "Population Welfare / Family Planning Services",
    purpose: "Provide family planning counselling, contraceptives, and reproductive health services.",
    eligibility: "All citizens seeking family planning services; no income restriction.",
    benefits: "Counselling, contraceptive supplies (pills, condoms), IUCDs, sterilization services at designated centers.",
    required_documents: ["CNIC recommended for procedures"],
    cost: "Free or subsidized at public facilities",
    how_to_apply: "Visit local family planning center, BHU or designated public hospital; some services require appointment.",
    notes: "Programs coordinated by provincial Population Welfare Departments."
  },
  {
    name: "Drug Addiction Treatment & Rehabilitation (Government Centers)",
    purpose: "Provide detoxification, counselling and rehabilitation services for substance use disorders.",
    eligibility: "Persons seeking treatment for drug addiction; some centers accept walk-ins while others require referral.",
    benefits: "Detox, counselling, rehabilitation programs, and sometimes vocational support.",
    required_documents: ["CNIC (for registration)"],
    cost: "Often free or subsidized in government facilities",
    how_to_apply: "Contact provincial drug treatment centers, Ministry of Narcotics Control helplines or local health facilities for referral.",
    notes: "Quality and capacity vary by province; NGOs often complement government services."
  },
  {
    name: "National Institute of Rehabilitation Medicine (NIRM) & Assistive Devices Programs",
    purpose: "Rehabilitation services, prosthetics, physiotherapy and distribution of assistive devices.",
    eligibility: "Persons with disability or in need of rehabilitation as diagnosed by clinicians.",
    benefits: "Assessment, rehab sessions, prosthetic limbs, mobility aids (where stocks available) and training.",
    required_documents: ["CNIC, medical referral/doctor's note"],
    cost: "Often free or subsidized in public institutes",
    how_to_apply: "Visit NIRM or provincial rehabilitation centers with clinical referral for assessment and device prescription.",
    notes: "Wait times and device availability vary; NGOs sometimes assist with device procurement."
  },
  {
    name: "Free Dialysis & Kidney Treatment Programs (Government Hospitals)",
    purpose: "Provide dialysis and kidney care to patients who cannot afford private treatment.",
    eligibility: "Patients diagnosed with kidney failure needing dialysis; priority often given to low-income patients.",
    benefits: "Subsidized or free dialysis sessions, kidney disease management and referrals for transplant evaluation (where available).",
    required_documents: ["CNIC, medical records, referral from clinician"],
    cost: "Often free or subsidized in public hospitals",
    how_to_apply: "Register at government hospital nephrology/dialysis unit or through provincial program registration; emergency access via hospitals.",
    notes: "Capacity is limited in many districts; some provinces run subsidized dialysis centers."
  },
  {
    name: "Free Liver & Cardiac Support Programs (Govt Hospitals and Provincial Schemes)",
    purpose: "Provide subsidized or free treatment for liver and cardiac conditions (surgery, intervention) under provincial schemes/charity programs.",
    eligibility: "Patients diagnosed with qualifying cardiac or liver conditions; eligibility criteria and selection vary by program/province.",
    benefits: "Subsidized surgeries, diagnostics and follow-up at designated hospitals; sometimes financial assistance for high-cost procedures.",
    required_documents: ["CNIC, clinical reports, referral"],
    cost: "Free/subsidized depending on scheme",
    how_to_apply: "Apply through designated hospital social welfare/finance office or provincial health program desk for assistance.",
    notes: "Many such supports are means-tested or limited-budget programs; waitlists can apply."
  },
  {
    name: "Thalassemia & Genetic Disease Support Programs",
    purpose: "Provide treatment support for thalassemia patients (regular transfusions), genetic counselling and screening services.",
    eligibility: "Thalassemia patients registered at public thalassemia centers; family members for screening.",
    benefits: "Free/subsidized blood transfusions, chelation therapy support (where provided), counselling and screening.",
    required_documents: ["CNIC, patient medical records"],
    cost: "Often free or subsidized at government centers",
    how_to_apply: "Register at district/regional thalassemia center or public hospital; NGOs may run dedicated centers.",
    notes: "Blood supply reliability is a common challenge; NGOs often partner in service delivery."
  },
  {
    name: "Provincial Health Insurance / Health Card Programs",
    purpose: "Provincial implementations of health insurance providing inpatient/certain outpatient benefits for residents.",
    eligibility: "Province residents; targeting varies: some universal (e.g., KP), others target low-income families or selected districts.",
    benefits: "Cashless inpatient care, maternity and priority procedures up to provincial coverage limits.",
    required_documents: ["CNIC", "Proof of provincial residence (if requested)"],
    cost: "Free for covered services",
    how_to_apply: "Check provincial helpline/short code or visit provincial health department page; present CNIC at empanelled hospitals.",
    notes: "Each province sets its own packages, limits and empanelled hospitals; integration with federal Sehat Sahulat varies."
  },
  {
    name: "Pakistan Bait-ul-Mal Medical Assistance Program",
    purpose: "Provide medical financial assistance to extremely poor individuals/families for high-cost treatments.",
    eligibility: "Very low-income households verified by Pakistan Bait-ul-Mal means-testing or social welfare criteria.",
    benefits: "Grants or financial assistance for specific medical procedures and hospitalization costs.",
    required_documents: ["CNIC, proof of income/poverty status, medical reports", "Estimates/quotations for treatment"],
    cost: "Assistance / grant (not a loan)",
    how_to_apply: "Apply at Pakistan Bait-ul-Mal offices or through their designated medical assistance application process with supporting documents.",
    notes: "Approval is discretionary and subject to available funds and verification."
  },
  {
    name: "PMDC Disability Certification & Assistive Device Programs",
    purpose: "Medical certification of disability and facilitation of government support/assistive device distribution.",
    eligibility: "Persons with disabilities assessed and certified by authorized medical boards/centers.",
    benefits: "Official disability certification, possible access to subsidies, assistive devices and priority services (where programs exist).",
    required_documents: ["CNIC, medical records, referral to certification board"],
    cost: "Certification may be free; devices subsidized or free depending on program",
    how_to_apply: "Obtain referral to authorized disability certification board via public hospital; submit documentation and undergo assessment.",
    notes: "Certification procedure and linked entitlements vary by province and implementing body."
  },
  {
    name: "Community-Based Health Insurance / Pilot Schemes",
    purpose: "Small-scale insurance/pilot programs to cover primary/secondary care in select communities, often NGO or donor-supported.",
    eligibility: "Residents of pilot areas or members of participant community groups; scheme-specific.",
    benefits: "Subsidized or pooled coverage for defined health services as per pilot design.",
    required_documents: ["Membership record, CNIC"],
    cost: "Usually low-premium or donor-subsidized",
    how_to_apply: "Register with local pilot scheme organizers, community health committees or NGO partners.",
    notes: "Not nationwide; scope and benefits depend on pilot design and funding partner."
  }
];

export const PROGRAMS_SYSTEM_PROMPT = `You are a dedicated Pakistan Health Programs Advisor module in a citizen-services health app. Your ONLY job is to provide complete, simple, and verified information about ALL major health programs available for Pakistani citizens.

OUTPUT STYLE:
• Always use short bullet points
• Write in simple language understandable by any citizen
• Be accurate and avoid outdated programs
• Never provide links; only provide steps and criteria
• Keep the format consistent for every program

FORMAT FOR EVERY PROGRAM:
----------------------------------------------------
### Program Name

• **Purpose:** [brief description]
• **Eligibility Criteria:** [who can apply]
• **Benefits / What Citizens Get:** [what they receive]
• **Required Documents:** [list of documents]
• **Cost:** [Free/Paid/Subsidized]
• **How to Apply / Where to Go:** [steps to apply]
----------------------------------------------------

SPECIAL LOGIC:
If the user asks "Which program am I eligible for?", check their:
• CNIC age
• Province
• Income level (if given)
• Health condition (TB, liver, kidney, pregnancy, child vaccination, etc.)
• Disability status
• Whether they are registered in BISP

and return ONLY the relevant programs they qualify for.

If the user asks "What documents are needed?", list CNIC, B-Form, hospital slip, doctor prescription (if applicable), and proof of income (for Bait-ul-Mal).

If the user asks for "all programs", output the full list.

You have access to these ${healthPrograms.length} programs in your knowledge base. Answer questions about them accurately.`;
