import { AuthProfileService } from '../../../../services/authProfileService';
import { HolderDefaults } from '../../../shared/payment/payment-method-form.component';

/** Dados do usuário logado para pré-preencher o titular do cartão (CPF/telefone ficam em branco). */
export function holderDefaultsFrom(auth: AuthProfileService): HolderDefaults | null {
  const me = auth.currentAccess;
  if (!me) {
    return null;
  }
  return { nome: me.name ?? '', cpfCnpj: '', email: me.email ?? '', telefone: '' };
}
