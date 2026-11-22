'use client';

import { useActionState } from 'react';

import { Alert } from '@/components/alert/alert';
import { Avatar } from '@/components/avatar/avatar';
import { Button } from '@/components/button/button';
import { TextField } from '@/components/text-field/text-field';

import { saveProfile } from './actions';

type Props = {
  userId: string;
  displayName: string;
  fullName: string | null;
  email: string;
  photoSource: string;
  hasGooglePhoto: boolean;
};

export function ProfileForm({
  userId,
  displayName,
  fullName,
  email,
  photoSource,
  hasGooglePhoto,
}: Props) {
  const [state, action, pending] = useActionState(saveProfile, null);
  const saved = state?.ok === true;
  const error = state && !state.ok ? state : null;
  const nameError = error?.reason === 'display_name' ? error.message : null;
  const photoError = error?.reason === 'photo';

  return (
    <form className="admin-form" action={action}>
      <Avatar
        name={displayName || fullName}
        src={photoSource === 'provider' ? `/admin/api/avatar/${userId}` : null}
      />
      {error && !nameError && !photoError ? (
        <Alert variant="danger" icon="error" title="Não foi possível salvar">
          {error.message}
        </Alert>
      ) : null}
      {saved ? (
        <Alert variant="success" title="Perfil atualizado">
          As alterações foram salvas.
        </Alert>
      ) : null}
      {nameError ? (
        <Alert variant="warning" title="Revise o nome de exibição">
          {nameError}
        </Alert>
      ) : null}
      <TextField
        label="Nome de exibição"
        name="display_name"
        defaultValue={displayName}
        required
        maxLength={80}
      />
      {photoError ? (
        <Alert variant="warning" title="Revise a opção de foto">
          Escolha Foto do Google ou Sem foto.
        </Alert>
      ) : null}
      <fieldset className="choice">
        <legend className="text-field-label">Foto</legend>
        <label>
          <input
            type="radio"
            name="foto"
            value="provider"
            defaultChecked={photoSource === 'provider'}
            disabled={!hasGooglePhoto}
          />
          Foto do Google
        </label>
        <label>
          <input
            type="radio"
            name="foto"
            value="none"
            defaultChecked={photoSource !== 'provider'}
          />
          Sem foto
        </label>
        {hasGooglePhoto ? null : <p>Não há uma foto do Google salva.</p>}
      </fieldset>
      <dl className="admin-details">
        <div>
          <dt>Nome completo</dt>
          <dd>{fullName ?? '—'}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{email}</dd>
        </div>
      </dl>
      <Button type="submit" loading={pending} loadingLabel="Salvando…">
        Salvar
      </Button>
    </form>
  );
}
