import SectionHeader from '../components/SectionHeader'
import LegalContainer from '../components/LegalContainer'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SectionHeader title="Conditions Générales d'Utilisation et de Vente" subtitle="Les règles applicables à vos commandes et à l'utilisation du site" />
      <LegalContainer>
        <h2>1. Objet</h2>
        <p>Les présentes CGV définissent les droits et obligations des parties dans le cadre de la vente des produits proposés par Tribal Print, notamment les tableaux personnalisés, photos Polaroïd, photo strips, mini photos, et autres produits de personnalisation.</p>

        <h2>2. Produits et Services</h2>
        <p>Tribal Print propose des produits de décoration personnalisés, tels que des tableaux, des photos Polaroïd, des albums et d’autres articles en fonction des stocks et des options de personnalisation disponibles.</p>

        <h2>3. Commandes</h2>
        <ul>
          <li><strong>Processus de commande:</strong> Commandes via notre site, WhatsApp ou Instagram.</li>
          <li><strong>Validation:</strong> Toute commande est confirmée dès réception du paiement.</li>
          <li><strong>Modification:</strong> Une fois validée, la commande ne peut être modifiée ou annulée.</li>
        </ul>

        <h2>4. Prix et Modalités de Paiement</h2>
        <ul>
          <li><strong>Prix:</strong> Affichés en FCFA, hors frais de livraison.</li>
          <li><strong>Paiement:</strong> Espèces, mobile money ou autres moyens convenus.</li>
          <li><strong>Défaut de paiement:</strong> En cas de non-paiement, la commande est annulée.</li>
        </ul>

        <h2>5. Livraison</h2>
        <ul>
          <li><strong>Délai:</strong> Mercredi et samedi entre 10h et 18h.</li>
          <li><strong>Frais:</strong> À la charge du client.</li>
          <li><strong>Réception:</strong> Vérification obligatoire sous 48h.</li>
        </ul>

        <h2>6. Retours et Réclamations</h2>
        <p>Les produits personnalisés ne sont ni repris ni échangés sauf en cas de défaut ou d’erreur de notre part.</p>

        <h2>7. Responsabilité</h2>
        <p>Tribal Print ne saurait être tenu responsable des dommages indirects liés à l'achat de ses produits.</p>

        <h2>8. Propriété Intellectuelle</h2>
        <p>Les designs et logos de Tribal Print sont protégés et ne peuvent être reproduits sans autorisation.</p>

        <h2>9. Données Personnelles</h2>
        <p>Vos données sont utilisées uniquement pour le traitement des commandes, conformément à notre politique de confidentialité.</p>

        <h2>10. Modification des CGV</h2>
        <p>Tribal Print se réserve le droit de modifier ses CGV à tout moment.</p>

        <h2>11. Droit Applicable et Juridiction Compétente</h2>
        <p>Les CGV sont régies par le droit ivoirien.</p>

        <h2>12. Contact</h2>
        <p>Email: <a href="mailto:info.tribalprint@gmail.com">info.tribalprint@gmail.com</a><br />Téléphone: <a href="tel:+2250787502637">+225 07 87 50 26 37</a></p>

        <p className="mt-6 text-xs text-slate-500">© 2025 Tribal Print. Tous droits réservés.</p>
      </LegalContainer>
    </div>
  )
}
