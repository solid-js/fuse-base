#!/bin/bash
echo ""
echo "          Internal server                       Production server"
echo ""
echo "     +------------+-----------+          +-------------+----------------+"
echo "     |   master   |    qa     |          |   staging   |   production   |"
echo "     +------------+-----------+          +-------------+----------------+"
echo ""
echo "        Working     Internal                 Client         Online"
echo "        branch      review                   review         version"
echo ""
echo "                                                +              ^"
echo "                                                |              |"
echo "                                                +--------------+"
echo ""
echo "This script will merge staging into production and start a build."
echo "For security purpose, no automatic deployment into the production server."
echo ""
read -r -p "Are you sure? [y/N] " response
if ! [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
then
    exit
fi

echo "> Merging staging to production...";
git fetch . staging:production

echo "> Pushing production..."
git push origin production
