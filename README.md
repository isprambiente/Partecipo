[![Coverage Status](https://coveralls.io/repos/github/isprambiente/Partecipo/badge.svg?branch=master)](https://coveralls.io/github/isprambiente/Partecipo?branch=master)
[![Inline docs](http://inch-ci.org/github/remote-exec/command-designer.png)](http://inch-ci.org/github/isprambiente/Partecipo)
[![Yard Docs](http://img.shields.io/badge/yard-docs-blue.svg)](http://rubydoc.info/github/isprambiente/partecipo/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/be06f3229dd434cdd732/maintainability)](https://codeclimate.com/github/isprambiente/Partecipo/maintainability)

# Partecipo!

Il programma, interamente sviluppato all'interno del settore Sviluppo di AGP-INF, nasce da una specifica necessità di [I.S.P.R.A.](http://www.isprambiente.gov.it) nel gestire le prenotazioni degli eventi per i dipendenti ISPRA.

Il programma è stato appositamente sviluppato su piattaforma web per consentire l'accesso alle risorse interne tramite l'utilizzo di un comune browser web.

All'interno dell'applicazione è possibile gestire la pubblicazione di eventi e le partecipazioni nelle varie date. 

## Licenza
Il codice sorgente del sito progetto è rilasciato sotto licenza MIT License (codice SPDX: MIT). La licenza è visibile nel file [LICENSE](https://opensource.org/licenses/MIT)

## Repository
Questo repository contiene il codice sorgente del programma.

Il sito è sviluppato in linguaggio Ruby 2.7, framework Rails 6.0 e webpacker StimulusJS.

### Specifiche tecniche progetto
* [Ruby 3.0.x](https://www.ruby-lang.org)
* [RVM](https://rvm.io/)
* [Ruby on Rais 6.1](https://rubyonrails.org/)
* [NodeJS](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)
* [Webpacker StimulusJS](https://stimulusjs.org/)
* [Postgresql](https://www.postgresql.org/)
* HTML5 + CSS3
* no jQuery
* [Server CAS](https://rubycas.github.io/) - autenticazione SingleSignOn
* [Openssl](https://www.openssl.org/) - 

\* In alternativa al server CAS e` necessario sviluppare altri sistemi di autenticazione come ldap

### Requisiti tecnici per ambiente server
* Sistema operativo: Linux
* Gestore pacchetto ruby: RVM
* Linguaggio di programmazione: Ruby 3.0
* Framework: Rais 6.1
* Webpacker: StimulusJS
* Database: PostgreSQL >= 12.2
* NodeJS: JavaScript runtime >= v13.10
* Package Manager: Yarn >= 1.22
* Deploy applicazione: Accesso ssh per deploy applicazione via Capistrano
* Webserver: Nginx + Puma
* Autenticazione utenti: CAS Server

### Requisiti minimi per i client
* Mozilla Firefox 53, Chrome 58, Microsoft Edge, Internet Explorer 11, Safari 9.0 o altro browser compatibile con HTML 5, CSS 3;
* Per Internet Explorer 11 la modalità di compatibilità deve essere disattivata;
* Javascript abilitato;
* Cookie abilitati;
* Supporto ai certificati SSL;
* Risoluzione schermo 1024x768.

### Configurazione consigliata per i client
* Mozilla Firefox >= 53, Chrome >= 58, Microsoft Edge, Safari 9.0 o altro browser compatibile con HTML 5 e CSS 3;
* Javascript abilitato;
* Cookie abilitati;
* Supporto ai certificati SSL;

## Installazione ambiente
Installare ruby 3.0.2, consigliato [RVM](https://rvm.io/).

## Installazione applicazione

### In sviluppo

1. Clonare il progetto in sviluppo 

    ```
      git clone https://github.com/isprambiente/medplan.git
    ```

2. Da una shell posizionarsi sulla root del progetto ed eseguire

    ```
      gem install bundle
      bundle install
      yarn install
    ```

3. Creare il file `config/settings.local.yml` partendo da `config/settings.yml` per sovrascrivere i parametri di default. Il file è incluso nel `.gitignore` pertanto sarà necessario ricopiarlo manualmente sul server nel path `shared/config/settings.local.yml`

### Demo con docker / docker compose
1. Clonare il progetto in sviluppo 

    ```
      git clone https://github.com/isprambiente/medplan.git
    ```

2. Configurare il DNS o modificare il proprio file hosts per risolvere il nome cas-mock-server sull'indirizzo del server docker.

   Nel seguente esempio il docker viene eseguito localmente e viene modificato il file `/etc/hosts` del computer locale.
   
   ```
    127.0.0.1       localhost cas-mock-server
   ```
   la modifica è necessaria per raggiungere con un nome condiviso il server CAS

3. Eseguire la build del docker tramite compose
    
   ```
   sudo docker-compose up --build -d
   ```

4. Per accedere utilizzare le seguenti credenziali:
  * partecipouser   - password   # per utente standard
  * partecipoeditor - password   # per utente editor
  * partecipoadmin  - password   # per utente admin

### Partecipa!
Puoi collaborare allo sviluppo dell'applicazione e della documentazione tramite (github)[https://github.com/isprambiente/Partecipo].

Tramite (Github discussion)[https://github.com/isprambiente/Partecipo/discussions] è possibile richiedere e dare aiuto a chi ne avesse bisogno.
