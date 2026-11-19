import { describe, expect, it } from 'vitest';

import {
  auditCatalog,
  parseAuditMetadata,
  storedActorType,
  type AuditAction,
} from './actions';
import { renderAudit } from './render';

const USER = 'a1d00000-0000-4000-8000-000000000010';
const ROLE = 'a1d00000-0000-4000-8000-000000000002';

const metadata: Record<AuditAction, Record<string, unknown>> = {
  'bootstrap.claimed': {},
  'user.registered': { invitation_id: USER },
  'user.terms_accepted': {
    terms_version: '2026-11-18',
    privacy_notice_version: '2026-11-18',
  },
  'user.profile_updated': { fields: ['display_name'] },
  'user.full_name_updated': {},
  'user.role_changed': {
    from_role_id: null,
    to_role_id: ROLE,
    from_role_name: null,
    to_role_name: 'atendimento',
  },
  'user.disabled': {},
  'user.enabled': {},
  'user.deleted': {},
  'user.anonymized': {},
  'invitation.created': {},
  'invitation.canceled': {},
  'role.created': { name: 'atendimento' },
  'role.renamed': { name: 'loja', previous_name: 'atendimento' },
  'role.deleted': { name: 'loja' },
};

describe('audit catalog', () => {
  it('parses the metadata for every action and rejects extra fields', () => {
    for (const action of Object.keys(auditCatalog) as AuditAction[]) {
      expect(parseAuditMetadata(action, metadata[action])).toEqual(
        metadata[action],
      );
    }
    expect(() =>
      parseAuditMetadata('bootstrap.claimed', { note: 'free text' }),
    ).toThrow();
  });

  it('stores an admin as a user actor', () => {
    expect(storedActorType('system')).toBe('system');
    expect(storedActorType('user')).toBe('user');
    expect(storedActorType('admin')).toBe('user');
  });
});

describe('renderAudit', () => {
  it('writes the pt-BR sentence and hides a missing name', () => {
    expect(renderAudit('bootstrap.claimed', {}, {})).toBe(
      'o primeiro admin foi criado',
    );
    expect(
      renderAudit('user.registered', { invitation_id: null }, { user: 'Ana' }),
    ).toBe('Ana entrou no sistema');
    expect(renderAudit('user.registered', {}, { user: '  ' })).toBe(
      'Usuário removido entrou no sistema',
    );
    expect(renderAudit('user.registered', {}, {})).toBe(
      'Usuário removido entrou no sistema',
    );
    expect(
      renderAudit('user.terms_accepted', { terms_version: '2026-11-18' }, {}),
    ).toBe('aceitou os termos de uso versão 2026-11-18');
    expect(renderAudit('user.terms_accepted', { terms_version: 1 }, {})).toBe(
      'aceitou os termos de uso versão ',
    );
    expect(renderAudit('user.profile_updated', {}, {})).toBe(
      'atualizou o perfil',
    );
    expect(renderAudit('user.full_name_updated', {}, { user: 'Ana' })).toBe(
      'alterou o nome completo de Ana',
    );
    expect(
      renderAudit(
        'user.role_changed',
        { from_role_name: 'estoque', to_role_name: 'atendimento' },
        { user: 'Ana' },
      ),
    ).toBe("mudou o papel de Ana de 'estoque' para 'atendimento'");
    expect(renderAudit('user.disabled', {}, { user: 'Ana' })).toBe(
      'desabilitou Ana',
    );
    expect(renderAudit('user.enabled', {}, { user: 'Ana' })).toBe(
      'habilitou Ana',
    );
    expect(renderAudit('user.deleted', {}, {})).toBe('excluiu um usuário');
    expect(renderAudit('user.anonymized', {}, {})).toBe(
      'anonimizou um usuário',
    );
    expect(renderAudit('invitation.created', {}, {})).toBe('criou um convite');
    expect(renderAudit('invitation.canceled', {}, {})).toBe(
      'cancelou um convite',
    );
    expect(renderAudit('role.created', { name: 'loja' }, {})).toBe(
      "criou o papel 'loja'",
    );
    expect(
      renderAudit('role.renamed', { previous_name: 'loja', name: 'caixa' }, {}),
    ).toBe("renomeou o papel 'loja' para 'caixa'");
    expect(renderAudit('role.deleted', { name: 'loja' }, {})).toBe(
      "excluiu o papel 'loja'",
    );
    expect(renderAudit('role.deleted', {}, {})).toBe("excluiu o papel ''");
  });
});
