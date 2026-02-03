/**
 * Tooltips de ayuda para los campos del wizard
 * Siguiendo el patrón del catálogo
 */

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

export interface FieldTooltips {
  [key: string]: FieldTooltipInfo;
}

// Datos Personales
export const datosPersonalesTooltips: FieldTooltips = {
  nombres: {
    title: '¿Qué debo poner?',
    description: 'Ingresa tus nombres tal como aparecen en tu documento de identidad.',
    recommendation: 'Escribe todos tus nombres completos.',
  },
  apellidos: {
    title: '¿Qué debo poner?',
    description: 'Ingresa tus apellidos paterno y materno tal como aparecen en tu documento.',
    recommendation: 'Escribe ambos apellidos separados por un espacio.',
  },
  tipoDocumento: {
    title: '¿Qué documento usar?',
    description: 'Selecciona el tipo de documento con el que te identificas. El DNI es el más común para peruanos.',
    recommendation: 'Si eres extranjero, usa Carnet de Extranjería.',
  },
  numeroDocumento: {
    title: '¿Dónde lo encuentro?',
    description: 'Es el número que aparece en la parte frontal de tu documento de identidad.',
    recommendation: 'El DNI tiene 8 dígitos, el CE tiene 9 dígitos.',
  },
  fechaNacimiento: {
    title: '¿Por qué la necesitamos?',
    description: 'Tu fecha de nacimiento nos ayuda a verificar tu identidad y calcular tu edad.',
    recommendation: 'Debes ser mayor de 18 años para solicitar un préstamo.',
  },
  celular: {
    title: '¿Para qué lo usamos?',
    description: 'Tu número de celular será usado para enviarte notificaciones importantes sobre tu solicitud.',
    recommendation: 'Asegúrate de que sea un número donde puedas recibir llamadas y SMS.',
  },
  email: {
    title: '¿Para qué lo usamos?',
    description: 'Te enviaremos información importante sobre tu solicitud y actualizaciones del proceso.',
    recommendation: 'Usa un correo que revises frecuentemente.',
  },
};

// Datos Académicos
export const datosAcademicosTooltips: FieldTooltips = {
  institucion: {
    title: '¿Qué institución poner?',
    description: 'Ingresa el nombre completo de tu universidad, instituto o colegio donde estudias actualmente.',
    recommendation: 'Escribe el nombre oficial completo.',
  },
  tipoInstitucion: {
    title: '¿Cuál seleccionar?',
    description: 'Indica si estudias en una universidad, instituto técnico o colegio.',
  },
  carrera: {
    title: '¿Qué carrera poner?',
    description: 'Indica la carrera o especialidad que estás cursando actualmente.',
    recommendation: 'Si estás en colegio, puedes dejarlo en blanco.',
  },
  ciclo: {
    title: '¿Qué ciclo seleccionar?',
    description: 'Selecciona el ciclo académico en el que te encuentras actualmente matriculado.',
    recommendation: 'Si ya terminaste tus estudios, selecciona "Egresado".',
  },
  constanciaEstudios: {
    title: '¿Qué documento subir?',
    description: 'Sube una constancia de estudios o matrícula vigente que demuestre que estás estudiando.',
    recommendation: 'Puede ser PDF o imagen. Máximo 5MB.',
  },
};

// Datos Económicos
export const datosEconomicosTooltips: FieldTooltips = {
  situacionLaboral: {
    title: '¿Qué opción elegir?',
    description: 'Selecciona la opción que mejor describa tu situación laboral actual.',
    recommendation: 'Si trabajas medio tiempo, selecciona "Empleado".',
  },
  ingresoMensual: {
    title: '¿Qué monto poner?',
    description: 'Indica tu ingreso mensual aproximado en soles. Incluye sueldo, propinas, trabajos freelance, etc.',
    recommendation: 'Si no tienes ingresos, puedes poner 0.',
  },
  tieneAval: {
    title: '¿Qué es un aval?',
    description: 'Un aval o codeudor es una persona que se compromete a pagar el préstamo si tú no puedes hacerlo.',
    recommendation: 'Tener aval puede mejorar tus posibilidades de aprobación.',
  },
  comentarios: {
    title: '¿Qué puedo escribir?',
    description: 'Aquí puedes agregar cualquier información adicional que consideres relevante para tu solicitud.',
    recommendation: 'Por ejemplo: si tienes otros ingresos, becas, o situaciones especiales.',
  },
};

// Export all tooltips
export const fieldTooltips = {
  ...datosPersonalesTooltips,
  ...datosAcademicosTooltips,
  ...datosEconomicosTooltips,
};
