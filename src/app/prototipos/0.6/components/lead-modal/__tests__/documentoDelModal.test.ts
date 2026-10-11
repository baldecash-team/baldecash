import {
  TIPOS_DOCUMENTO,
  errorDeDocumento,
  errorDel422,
  normalizarDocumento,
  reglaDeDocumento,
} from '../documentoDelModal';
import type { CascadingOption } from '../../../services/wizardApi';

/**
 * La regla del documento en el modal del cupón: solo letras A-Z y números,
 * sin espacios, en mayúsculas; DNI 8 dígitos, carné de extranjería 9 a 12,
 * pasaporte 6 a 12. Es la misma de la lista de documentos del cupón.
 */

const MSJ_DNI = 'El DNI debe tener 8 dígitos';
const MSJ_CE = 'El carné de extranjería debe tener entre 9 y 12 letras o números';
const MSJ_PAS = 'El pasaporte debe tener entre 6 y 12 letras o números';

describe('errorDeDocumento — DNI', () => {
  it('acepta 8 dígitos', () => {
    expect(errorDeDocumento('DNI', '12345678')).toBeNull();
  });

  it.each(['1234567', '123456789', '', '1234567A', '1234 678', '12.345.678'])(
    'rechaza «%s» con el mensaje del DNI',
    (numero) => {
      expect(errorDeDocumento('DNI', numero)).toBe(MSJ_DNI);
    }
  );
});

describe('errorDeDocumento — carné de extranjería', () => {
  it('acepta 9 caracteres', () => {
    expect(errorDeDocumento('CE', '001234567')).toBeNull();
  });

  it('acepta 12 caracteres', () => {
    expect(errorDeDocumento('CE', '001234567890')).toBeNull();
  });

  it('acepta letras: hay carnés reales con letras', () => {
    expect(errorDeDocumento('CE', 'CE001234X')).toBeNull();
  });

  it.each(['12345678', '1234567890123', 'CE-001234X', 'CE 001234X'])(
    'rechaza «%s» con el mensaje del carné',
    (numero) => {
      expect(errorDeDocumento('CE', numero)).toBe(MSJ_CE);
    }
  );
});

describe('errorDeDocumento — pasaporte', () => {
  it('acepta 6 caracteres con letras', () => {
    expect(errorDeDocumento('PAS', 'AB12CD')).toBeNull();
  });

  it('acepta 12 caracteres', () => {
    expect(errorDeDocumento('PAS', 'AB1234567890')).toBeNull();
  });

  it('rechaza 5 caracteres', () => {
    expect(errorDeDocumento('PAS', 'AB12C')).toBe(MSJ_PAS);
  });

  it('rechaza 13 caracteres', () => {
    expect(errorDeDocumento('PAS', 'AB12345678901')).toBe(MSJ_PAS);
  });

  it.each(['AB-12CD', 'AB 12CD', 'AB12CD!', 'ÑB12CD', 'AB12CD\n'])(
    'rechaza símbolos y espacios: «%s»',
    (numero) => {
      expect(errorDeDocumento('PAS', numero)).toBe(MSJ_PAS);
    }
  );

  it('rechaza minúsculas sin normalizar: lo que se guarda va en mayúsculas', () => {
    expect(errorDeDocumento('PAS', 'ab12cd')).toBe(MSJ_PAS);
    expect(errorDeDocumento('PAS', normalizarDocumento('ab12cd'))).toBeNull();
  });
});

describe('errorDeDocumento — sin tipo', () => {
  it('pide elegir el tipo antes de mirar el número', () => {
    expect(errorDeDocumento('', '12345678')).toBe('Elige tu tipo de documento.');
  });
});

describe('normalizarDocumento', () => {
  it('pasa las minúsculas a mayúsculas', () => {
    expect(normalizarDocumento('ab12cd')).toBe('AB12CD');
  });

  it('quita espacios, guiones y puntos', () => {
    expect(normalizarDocumento('  ab 12-cd. ')).toBe('AB12CD');
  });

  it('con el DNI se queda solo con los dígitos', () => {
    expect(normalizarDocumento('12a34 56-78', reglaDeDocumento('DNI'))).toBe('12345678');
  });

  it('no recorta el largo: un número de 13 sigue de 13 y la validación lo rechaza', () => {
    const numero = normalizarDocumento('ab12345678901', reglaDeDocumento('PAS'));
    expect(numero).toBe('AB12345678901');
    expect(errorDeDocumento('PAS', numero)).toBe(MSJ_PAS);
  });
});

describe('reglaDeDocumento', () => {
  it('sin catálogo usa la tabla de respaldo del formulario de solicitud', () => {
    expect(reglaDeDocumento('DNI')).toMatchObject({ min: 8, max: 8, numerico: true, mensaje: MSJ_DNI });
    expect(reglaDeDocumento('CE')).toMatchObject({ min: 9, max: 12, numerico: false, mensaje: MSJ_CE });
    expect(reglaDeDocumento('PAS')).toMatchObject({ min: 6, max: 12, numerico: false, mensaje: MSJ_PAS });
  });

  it('solo el DNI pide teclado numérico y cada tipo trae su placeholder', () => {
    expect(reglaDeDocumento('DNI')?.placeholder).toBe('12345678');
    expect(reglaDeDocumento('CE')?.placeholder).toBe('001234567');
    expect(reglaDeDocumento('PAS')?.placeholder).toBe('AB123456');
  });

  it('con catálogo, los largos salen del catálogo y el mensaje los sigue', () => {
    const catalogo: CascadingOption[] = [
      {
        value: 'pasaporte',
        label: 'Pasaporte',
        validation: { min_length: 7, max_length: 9, input_mode: 'text', placeholder: 'ZZ12345' },
      },
    ];
    const regla = reglaDeDocumento('PAS', catalogo);
    expect(regla).toMatchObject({ min: 7, max: 9, placeholder: 'ZZ12345' });
    expect(regla?.mensaje).toBe('El pasaporte debe tener entre 7 y 9 letras o números');
    expect(errorDeDocumento('PAS', 'AB12CD', catalogo)).toBe(regla?.mensaje);
    expect(errorDeDocumento('PAS', 'AB12CD7', catalogo)).toBeNull();
  });

  it('si el catálogo no trae el tipo o viene sin largos, cae al respaldo', () => {
    const sinPasaporte: CascadingOption[] = [{ value: 'dni', label: 'DNI' }];
    expect(reglaDeDocumento('PAS', sinPasaporte)).toMatchObject({ min: 6, max: 12 });
    expect(reglaDeDocumento('DNI', sinPasaporte)).toMatchObject({ min: 8, max: 8 });
  });

  it('sin tipo no hay regla', () => {
    expect(reglaDeDocumento('')).toBeNull();
  });

  it('los tres tipos del selector tienen regla', () => {
    for (const t of TIPOS_DOCUMENTO) {
      expect(reglaDeDocumento(t.value)).not.toBeNull();
    }
  });
});

describe('errorDel422', () => {
  it('con `detail` de texto lo devuelve tal cual, para el campo del documento', () => {
    expect(errorDel422({ detail: MSJ_PAS })).toEqual({ campo: 'doc', mensaje: MSJ_PAS });
  });

  it('con la lista de FastAPI ubica el campo por `loc` y quita el prefijo de Pydantic', () => {
    expect(
      errorDel422({ detail: [{ loc: ['body', 'phone'], msg: 'Value error, El celular no es válido' }] })
    ).toEqual({ campo: 'phone', mensaje: 'El celular no es válido' });

    expect(
      errorDel422({
        detail: [{ loc: ['body', 'document_number'], msg: `Value error, ${MSJ_PAS}` }],
      })
    ).toEqual({ campo: 'doc', mensaje: MSJ_PAS });
  });

  it('no muestra los mensajes automáticos de Pydantic: están en inglés', () => {
    expect(
      errorDel422({
        detail: [{ loc: ['body', 'document_number'], msg: 'String should have at least 8 characters' }],
      })
    ).toBeNull();
  });

  it.each([null, undefined, {}, { detail: '' }, { detail: '   ' }, { detail: [] }, { detail: [{ loc: ['body', 'otro'], msg: 'x' }] }, 'texto'])(
    'sin un texto que mostrar devuelve null: %p',
    (cuerpo) => {
      expect(errorDel422(cuerpo)).toBeNull();
    }
  );
});
