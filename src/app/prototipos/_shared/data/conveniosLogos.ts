/**
 * Logos de Convenios BaldeCash
 *
 * Fuente centralizada de logos de instituciones educativas
 * y socios con convenio activo.
 *
 * Uso:
 * import { conveniosLogos, membresiaLogos, allPartnerLogos } from '@/app/prototipos/_shared/data/conveniosLogos';
 */

export interface ConvenioLogo {
  id: number;
  name: string;
  shortName: string;
  url: string;
  type: 'instituto' | 'universidad' | 'socio';
}

/**
 * Logos de instituciones educativas con convenio
 */
export const conveniosLogos: ConvenioLogo[] = [
  {
    id: 1,
    name: 'Ansimar Diseño de Modas',
    shortName: 'Ansimar',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c77aa9bfb70945f2f400e_logo-ansimar-diseno-de-modas.png%201.png',
    type: 'instituto',
  },
  {
    id: 2,
    name: 'Instituto Carrión',
    shortName: 'Carrión',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c77a937d84025e9c82d58_3%20Carri%C3%B3n%202.png',
    type: 'instituto',
  },
  {
    id: 3,
    name: 'Certus',
    shortName: 'Certus',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c77a99272a25a2e81ae6a_certus%202.png',
    type: 'instituto',
  },
  {
    id: 4,
    name: 'ISIL',
    shortName: 'ISIL',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c77a923235baab6905cfa_Group%202307.png',
    type: 'instituto',
  },
  {
    id: 5,
    name: 'Cibertec',
    shortName: 'Cibertec',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c77a9b79d511938e74125_6%20Cibertec%201.png',
    type: 'instituto',
  },
  {
    id: 6,
    name: 'Universidad Científica del Sur',
    shortName: 'UCSUR',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c77ab8b9d2506e89792d8_UCSUR%20LOGO.png',
    type: 'universidad',
  },
  {
    id: 7,
    name: 'Elitec',
    shortName: 'Elitec',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c7dc6daf0225bfd828acd_logo-elitec-slider.png',
    type: 'instituto',
  },
  {
    id: 8,
    name: 'Universidad Ricardo Palma',
    shortName: 'URP',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c7dc2444787716aca927b_Logos-convenios_0001_Ricardo-palma%201.png',
    type: 'universidad',
  },
  {
    id: 9,
    name: 'Jhalebet',
    shortName: 'Jhalebet',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c7dc237d84025e9ccd952_LOGO-JHALEBET%201.png',
    type: 'instituto',
  },
  {
    id: 10,
    name: 'IDAT',
    shortName: 'IDAT',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c7dc223c30ef3f074b3fc_Vector.png',
    type: 'instituto',
  },
  {
    id: 11,
    name: 'MRAP',
    shortName: 'MRAP',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c7dc2401537b9dfc2d51e_Logo%20MRAP%201.png',
    type: 'instituto',
  },
  {
    id: 12,
    name: 'Instituto San Fernando',
    shortName: 'San Fernando',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c9725679bc270fed020bb_Instituto%20de%20Gesti%C3%B3n%20%26%20Desarrollo%20San%20Fernando%20LOGO.png',
    type: 'instituto',
  },
  {
    id: 13,
    name: 'Senati',
    shortName: 'Senati',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97241f715c1e9ac6dfcb_4%20Senati%201.png',
    type: 'instituto',
  },
  {
    id: 14,
    name: 'SISE',
    shortName: 'SISE',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97243368d41d4a90264b_SISE%20LOGO.png',
    type: 'instituto',
  },
  {
    id: 15,
    name: 'TECSUP',
    shortName: 'TECSUP',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97247f31ad0cf1646031_8%20TECSUP%202.png',
    type: 'instituto',
  },
  {
    id: 16,
    name: 'Toulouse Lautrec',
    shortName: 'Toulouse',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97247f31ad0cf1646006_10%20Toulouse%201.png',
    type: 'instituto',
  },
  {
    id: 17,
    name: 'UCAL',
    shortName: 'UCAL',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c9724ce86b4d16858024d_11%20UCAL%201.png',
    type: 'universidad',
  },
  {
    id: 18,
    name: 'UTP',
    shortName: 'UTP',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97244b484a7cf98bd37a_Vector.png',
    type: 'universidad',
  },
  {
    id: 19,
    name: 'Universidad Nacional Autónoma de Alto Amazonas',
    shortName: 'UNAAA',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c9724ce518e6a12bc23f2_17%20UNAAA%201.png',
    type: 'universidad',
  },
  {
    id: 20,
    name: 'Universidad Nacional Amazónica de Madre de Dios',
    shortName: 'UNAMAD',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c972376bad9b71846d094_UNAMAD%20LOGO%20(1).png',
    type: 'universidad',
  },
  {
    id: 21,
    name: 'Universidad Nacional de la Amazonía Peruana',
    shortName: 'UNAP',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97247214bde1b77ab0dc_UNAP%20LOGOS.png',
    type: 'universidad',
  },
  {
    id: 22,
    name: 'Universidad Nacional de Barranca',
    shortName: 'UNAB',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97244fda8b2facdc4a2f_13%20Universidad%20Barranca%202.png',
    type: 'universidad',
  },
  {
    id: 23,
    name: 'Universidad Nacional Daniel Alcides Carrión',
    shortName: 'UNDAC',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c9724d88c03340dfde91b_UNDAC.png',
    type: 'universidad',
  },
  {
    id: 24,
    name: 'UTEC',
    shortName: 'UTEC',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97243148c96ffab92cfc_Logo-UTEC%202.png',
    type: 'universidad',
  },
  {
    id: 25,
    name: 'Universidad Nacional San Luis Gonzaga',
    shortName: 'UNICA',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c9723209f07139c7a09a7_14%20San%20Luis%20Gonzaga%202.png',
    type: 'universidad',
  },
  {
    id: 26,
    name: 'Universidad Nacional Intercultural de la Selva Central Juan Santos Atahualpa',
    shortName: 'UNISCJSA',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97239c7d0a43e4baa2f7_15%20UNISCJSA%202.png',
    type: 'universidad',
  },
  {
    id: 27,
    name: 'Universidad Nacional del Centro del Perú',
    shortName: 'UNCP',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c9723367b4e10c2137cd6_logo-uncp-2024%201.png',
    type: 'universidad',
  },
  {
    id: 28,
    name: 'Universidad Nacional de Juliaca',
    shortName: 'UNAJ',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97233368d41d4a9025a3_18%20Universidad%20de%20Juliaca%201.png',
    type: 'universidad',
  },
  {
    id: 29,
    name: 'Universidad Nacional de Tumbes',
    shortName: 'UNTUMBES',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97236eecda34f16385ba_UNTUMBES%20LOGO.png',
    type: 'universidad',
  },
  {
    id: 30,
    name: 'Universidad Nacional Intercultural de Quillabamba',
    shortName: 'UNIQ',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c9723ce86b4d1685801c4_Logo_uniq_%201.png',
    type: 'universidad',
  },
  {
    id: 31,
    name: 'Universidad Nacional Toribio Rodríguez de Mendoza',
    shortName: 'UNTRM',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c9723dfa01fc7f46aaf19_12%20UNTRM%201.png',
    type: 'universidad',
  },
  {
    id: 32,
    name: 'Universidad Norbert Wiener',
    shortName: 'Wiener',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97236eecda34f163858c_5%20Wiener%201.png',
    type: 'universidad',
  },
  {
    id: 33,
    name: 'Universidad Peruana de Ciencias Aplicadas',
    shortName: 'UPC',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97232b703bfd964ee870_universidad-peruana-de-ciencias-aplicadas-upc-logo-B98C3A365C-seeklogo%201.png',
    type: 'universidad',
  },
  {
    id: 34,
    name: 'Universidad Privada del Norte',
    shortName: 'UPN',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c972324b38a6a21133bad_2%20UPN%202.png',
    type: 'universidad',
  },
  {
    id: 35,
    name: 'Universidad Nacional Agraria La Molina',
    shortName: 'UNALM',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677c97233368d41d4a9025d5_Vector%20(1).png',
    type: 'universidad',
  },
];

/**
 * Logos de socios y membresías
 */
export const membresiaLogos: ConvenioLogo[] = [
  {
    id: 36,
    name: 'ASBANC',
    shortName: 'ASBANC',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677ca1942b703bfd9656e357_ASBANC-2021%201.png',
    type: 'socio',
  },
  {
    id: 37,
    name: 'Fintech Perú',
    shortName: 'Fintech Perú',
    url: 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/677ca193d9dcce664e022767_Layer_1.png',
    type: 'socio',
  },
];

/**
 * Todos los logos combinados (convenios + membresías)
 */
export const allPartnerLogos: ConvenioLogo[] = [
  ...conveniosLogos,
  ...membresiaLogos,
];

/**
 * Helpers para filtrar logos
 */
export const getUniversidades = () =>
  conveniosLogos.filter((logo) => logo.type === 'universidad');

export const getInstitutos = () =>
  conveniosLogos.filter((logo) => logo.type === 'instituto');

export const getSocios = () => membresiaLogos;

/**
 * Obtener logo por shortName (para búsquedas rápidas)
 */
export const getLogoByShortName = (shortName: string): ConvenioLogo | undefined =>
  allPartnerLogos.find(
    (logo) => logo.shortName.toLowerCase() === shortName.toLowerCase()
  );

/**
 * Estadísticas
 */
export const conveniosStats = {
  totalConvenios: conveniosLogos.length,
  totalMembresias: membresiaLogos.length,
  totalUniversidades: conveniosLogos.filter((l) => l.type === 'universidad').length,
  totalInstitutos: conveniosLogos.filter((l) => l.type === 'instituto').length,
  total: allPartnerLogos.length,
};
